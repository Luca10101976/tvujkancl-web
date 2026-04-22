const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, message } = req.body;

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
