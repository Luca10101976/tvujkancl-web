const nodemailer = require('nodemailer');

const rateLimit = new Map();
const MAX_REQUESTS = 3;
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Příliš mnoho požadavků, zkuste za hodinu.' });
  }

  const { name, phone, email, service, message, website } = req.body;

  // honeypot — boti vyplní skryté pole "website"
  if (website) {
    return res.status(200).json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tvujkancl@gmail.com',
      pass: process.env.GMAIL_PASS,
    },
  });

  const body = [
    `Jméno: ${name || ''}`,
    `Telefon: ${phone || ''}`,
    `E-mail: ${email || ''}`,
    service ? `Zájem: ${service}` : '',
    message ? `\nCo vás brzdí:\n${message}` : '',
  ].filter(Boolean).join('\n');

  try {
    await transporter.sendMail({
      from: 'tvujkancl@gmail.com',
      to: 'tvujkancl@gmail.com',
      subject: `Poptávka z webu – ${name || 'neznámý'}`,
      text: body,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
