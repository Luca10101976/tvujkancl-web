const nodemailer = require('nodemailer');

const rateLimit = new Map();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimit.get(ip) || { count: 0, start: now };
  if (now - entry.start > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) return true;
  rateLimit.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

function sanitize(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Příliš mnoho požadavků, zkuste za hodinu.' });
  }

  const { name, phone, email, service, message, website } = req.body || {};

  // honeypot — boti vyplní skryté pole "website"
  if (website) {
    return res.status(200).json({ ok: true });
  }

  // Povinná pole + validace
  const cleanName  = sanitize(name, 100);
  const cleanEmail = sanitize(email, 200);
  const cleanPhone = sanitize(phone, 30);
  const cleanService = sanitize(service, 200);
  const cleanMessage = sanitize(message, 2000);

  if (!cleanName) {
    return res.status(400).json({ error: 'Jméno je povinné.' });
  }
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return res.status(400).json({ error: 'Neplatný e-mail.' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tvujkancl@gmail.com',
      pass: process.env.GMAIL_PASS,
    },
  });

  const body = [
    `Jméno: ${cleanName}`,
    `Telefon: ${cleanPhone}`,
    `E-mail: ${cleanEmail}`,
    cleanService ? `Zájem: ${cleanService}` : '',
    cleanMessage ? `\nCo vás brzdí:\n${cleanMessage}` : '',
  ].filter(Boolean).join('\n');

  try {
    await transporter.sendMail({
      from: 'tvujkancl@gmail.com',
      to: 'tvujkancl@gmail.com',
      subject: `Poptávka z webu – ${cleanName}`,
      text: body,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err.message);
    res.status(500).json({ error: 'Odeslání se nezdařilo, zkuste prosím znovu.' });
  }
}
