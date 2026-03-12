const bcrypt = require('bcryptjs');
const { sendMail } = require('../config/email');
const { OTP, OTP_TTL_SECONDS, MAX_OTP_ATTEMPTS } = require('../models/OTP.model');
const { generateOTP } = require('../utils/crypto');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10; // Lower than password — OTPs are short-lived

/**
 * Creates (or replaces) an OTP for the given email and type, then sends it.
 * Any existing OTP for the same email+type is deleted first.
 */
async function createAndSendOTP(email, type) {
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  // Atomic replace: delete old, insert new
  await OTP.deleteMany({ email, type });
  await OTP.create({ email, otpHash, type, expiresAt });

  await sendOTPEmail(email, otp, type);
  logger.info('OTP created and sent', { email, type });
}

/**
 * Verifies an OTP. On success, deletes the OTP document.
 * Returns true on success; throws a descriptive Error on failure.
 */
async function verifyOTP(email, plainOTP, type) {
  const record = await OTP.findOne({ email, type }).sort({ createdAt: -1 });

  if (!record) {
    throw Object.assign(new Error('OTP not found or already used. Please request a new one.'), {
      statusCode: 400,
    });
  }

  if (record.isExpired || record.expiresAt < new Date()) {
    await record.deleteOne();
    throw Object.assign(new Error('OTP has expired. Please request a new one.'), {
      statusCode: 400,
    });
  }

  if (record.isExhausted || record.attempts >= MAX_OTP_ATTEMPTS) {
    await record.deleteOne();
    throw Object.assign(new Error('Too many incorrect OTP attempts. Please request a new one.'), {
      statusCode: 429,
    });
  }

  const isMatch = await bcrypt.compare(plainOTP, record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();

    const remaining = MAX_OTP_ATTEMPTS - record.attempts;
    throw Object.assign(
      new Error(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt(s) remaining.`
          : 'Too many incorrect OTP attempts. Please request a new one.'
      ),
      { statusCode: 400 }
    );
  }

  // OTP is correct — consume it immediately
  await record.deleteOne();
  logger.info('OTP verified successfully', { email, type });
  return true;
}

// ── Email templates ───────────────────────────────────────────────────────────

async function sendOTPEmail(email, otp, type) {
  const isReset = type === 'PASSWORD_RESET';
  const subject = isReset ? 'InternNova — Password Reset OTP' : 'InternNova — Verify Your Email';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#4F46E5;padding:24px 32px;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">InternNova</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px;color:#374151;margin:0 0 16px;">
                ${isReset ? 'We received a request to reset your password.' : 'Please verify your email address to activate your account.'}
              </p>
              <p style="font-size:15px;color:#6B7280;margin:0 0 24px;">Use the OTP below. It expires in <strong>10 minutes</strong>.</p>
              <div style="text-align:center;background:#F3F4F6;border-radius:8px;padding:20px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#4F46E5;">${otp}</span>
              </div>
              <p style="font-size:13px;color:#9CA3AF;margin:24px 0 0;">
                If you did not request this, please ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #E5E7EB;">
              <p style="font-size:12px;color:#9CA3AF;margin:0;text-align:center;">
                &copy; ${new Date().getFullYear()} InternNova. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = isReset
    ? `InternNova Password Reset\n\nYour OTP is: ${otp}\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`
    : `InternNova Email Verification\n\nYour OTP is: ${otp}\nIt expires in 10 minutes.\n\nIf you did not request this, ignore this email.`;

  await sendMail({ to: email, subject, html, text });
}

module.exports = { createAndSendOTP, verifyOTP };
