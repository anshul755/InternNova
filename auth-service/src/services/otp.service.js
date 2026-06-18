const bcrypt = require('bcryptjs');
const { sendMail } = require('../config/email');
const { OTP, OTP_TTL_SECONDS, MAX_OTP_ATTEMPTS } = require('../models/OTP.model');
const { generateOTP } = require('../utils/crypto');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;

async function createAndSendOTP(email, type) {
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await OTP.deleteMany({ email, type });
  await OTP.create({ email, otpHash, type, expiresAt });

  if (process.env.NODE_ENV !== 'production') {
    console.log('');
    console.log('══════════════════════════════════════════════════');
    console.log(`  DEV OTP for ${email}`);
    console.log(`  CODE: ${otp}`);
    console.log(`  TYPE: ${type}`);
    console.log(`  EXPIRES: ${expiresAt.toISOString()}`);
    console.log('══════════════════════════════════════════════════');
    console.log('');
    logger.info('OTP logged to console (dev mode)', { email, type, otp });
  }

  try {
    await sendOTPEmail(email, otp, type);
    logger.info('OTP created and sent', { email, type });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && process.env.DEV_SKIP_EMAIL === 'true') {
      logger.warn('OTP email failed; using console OTP fallback (DEV_SKIP_EMAIL=true)', {
        email,
        type,
        error: err.message,
      });
      return;
    }

    logger.error('OTP email delivery failed', {
      email,
      type,
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
    throw err;
  }
}

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

  await record.deleteOne();
  logger.info('OTP verified successfully', { email, type });
  return true;
}

async function sendOTPEmail(email, otp, type) {
  const isReset = type === 'PASSWORD_RESET';
  const isDelete = type === 'PROFILE_DELETION';
  const frontendUrl = process.env.FRONTEND_URL || 'https://intern-nova.in';
  const logoUrl =
    process.env.EMAIL_LOGO_URL ||
    `${frontendUrl}/internNova-light.png`;

  const heading = isReset
    ? 'Reset Your Password'
    : isDelete
      ? 'Delete Your Profile'
      : 'Verify Your Email';
  const introLine = isReset
    ? 'We received a request to reset the password for your InternNova account.'
    : isDelete
      ? 'We received a request to delete your InternNova profile. This action is permanent and will delete all your related data.'
      : 'Welcome to InternNova! Please verify your email address to activate your account.';
  const actionLabel = isReset
    ? 'Password Reset Code'
    : isDelete
      ? 'Profile Deletion Code'
      : 'Email Verification Code';

  const primaryGreen = '#7cc84a';
  const greenDark = '#4a8a2e';
  const greenLight = '#e9f5e1';
  const textMain = '#0f172a';
  const textSecondary = '#334155';
  const textMuted = '#64748b';
  const surface = '#ffffff';
  const border = 'rgba(124, 200, 74, 0.25)';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${actionLabel}</title>
</head>
<body style="margin:0;padding:0;background:linear-gradient(180deg,#f8faf7 0%,#eef5eb 50%,#f4f8f2 100%);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr>
      <td align="center">
        <!-- ── Card ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${surface};border-radius:24px;overflow:hidden;box-shadow:0 1px 1px rgba(255,255,255,0.46) inset,0 16px 40px rgba(15,23,42,0.1),0 2px 10px rgba(15,23,42,0.06);border:1px solid ${border};">

          <!-- ══ Header ══ -->
          <tr>
            <td style="background:linear-gradient(135deg,${primaryGreen} 0%,${greenDark} 100%);padding:36px 32px 32px;text-align:center;">
              <img
                src="${logoUrl}"
                alt="InternNova"
                height="36"
                style="display:block;margin:0 auto 0;height:36px;width:auto;"
              />
            </td>
          </tr>

          <!-- ══ Body ══ -->
          <tr>
            <td style="padding:36px 32px 32px;">

              <h1 style="margin:0 0 8px;font-family:'Plus Jakarta Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.03em;color:${textMain};line-height:1.3;">
                ${heading}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:${textSecondary};">
                ${introLine}
              </p>

              <!-- ══ OTP Box ══ -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:${greenLight};border:1px solid ${border};border-radius:16px;padding:28px 24px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${primaryGreen};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
                      ${actionLabel}
                    </p>
                    <p style="margin:0;font-size:38px;font-weight:700;letter-spacing:0.16em;color:${textMain};font-family:'SF Mono','Fira Code','Cascadia Code','Consolas',monospace;line-height:1;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:13px;line-height:1.6;color:${textMuted};">
                This code expires in <strong style="color:${textSecondary};">10 minutes</strong>.
                If you did not request this, you can safely ignore this email — your account remains secure.
              </p>

              <!-- ══ Divider ══ -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
                <tr>
                  <td style="border-top:1px solid ${border};"></td>
                </tr>
              </table>

              <!-- ══ Need help ══ -->
              <p style="margin:0;font-size:12px;line-height:1.6;color:${textMuted};text-align:center;">
                Need help? Visit
                <a href="${frontendUrl}" style="color:${greenDark};text-decoration:underline;font-weight:500;">${frontendUrl.replace('https://', '').replace('http://', '')}</a>
              </p>
            </td>
          </tr>

          <!-- ══ Footer ══ -->
          <tr>
            <td style="background:${greenLight};padding:16px 32px;text-align:center;border-top:1px solid ${border};">
              <p style="margin:0;font-size:11px;color:${textMuted};line-height:1.5;">
                &copy; ${new Date().getFullYear()} InternNova. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        <!-- ══ Subtle glow accent ══ -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin-top:24px;">
          <tr>
            <td style="text-align:center;">
              <p style="margin:0;font-size:11px;color:${textMuted};opacity:0.7;">
                InternNova &mdash; Connecting talent with opportunity
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = isReset
    ? `INTERNNOVA — PASSWORD RESET CODE\n\nYour reset code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, ignore this email — your account remains secure.\n\n— InternNova`
    : isDelete
      ? `INTERNNOVA — PROFILE DELETION CODE\n\nYour profile deletion code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, ignore this email — your account remains secure.\n\n— InternNova`
      : `INTERNNOVA — EMAIL VERIFICATION CODE\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, ignore this email — your account remains secure.\n\n— InternNova`;

  const subject = isReset
    ? 'InternNova — Password Reset Code'
    : isDelete
      ? 'InternNova — Profile Deletion Code'
      : 'InternNova — Verify Your Email';

  await sendMail({ to: email, subject, html, text });
}

module.exports = { createAndSendOTP, verifyOTP };
