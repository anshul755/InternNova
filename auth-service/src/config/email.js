const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
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
      // In development, allow self-signed certs; in production, enforce valid TLS
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
    // Connection timeout (ms) — fail fast if SMTP is unreachable
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  };

  logger.info('Creating SMTP transporter', {
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    user: smtpConfig.auth.user,
  });

  transporter = nodemailer.createTransport(smtpConfig);

  transporter.on('error', (err) =>
    logger.error('SMTP transporter error', { error: err.message, stack: err.stack }),
  );

  return transporter;
}

async function verifyConnection() {
  try {
    const t = getTransporter();
    await t.verify();
    logger.info('SMTP connection verified successfully');
    return true;
  } catch (err) {
    logger.error('SMTP connection verification failed', {
      error: err.message,
      code: err.code,
      command: err.command,
    });
    return false;
  }
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  // Gmail overrides both address and display name to the authenticated
  // account's profile. Set EMAIL_FROM_NAME to control the sender name.
  const fromName = process.env.EMAIL_FROM_NAME || 'InternNova';
  const fromAddr = process.env.EMAIL_FROM_ADDR || process.env.SMTP_USER;
  const from = { name: fromName, address: fromAddr };
  const mailOptions = { from, to, subject, html, text };

  try {
    const info = await t.sendMail(mailOptions);
    logger.info('Email sent', {
      to,
      subject,
      messageId: info.messageId,
      response: info.response,
    });
    return info;
  } catch (err) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
    throw err;
  }
}

module.exports = { sendMail, verifyConnection };
