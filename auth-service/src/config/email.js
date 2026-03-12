'use strict';

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  transporter.on('error', (err) => logger.error('SMTP transporter error', { error: err.message }));

  return transporter;
}

/**
 * Sends an email. Throws on failure after retries.
 */
async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };

  await t.sendMail(mailOptions);
  logger.info('Email sent', { to, subject });
}

module.exports = { sendMail };
