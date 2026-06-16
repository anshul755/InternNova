const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { createAndSendOTP, verifyOTP } = require('./otp.service');
const logger = require('../utils/logger');

const REFRESH_TOKEN_SALT = 10;

function buildTokenPair(user) {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function AppError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function register({ email, password, role }) {
  const { OTP } = require('../models/OTP.model');
  const existing = await User.findOne({ email });

  if (existing) {
    // If the account is already verified, reject
    if (existing.isEmailVerified) {
      throw AppError('An account with this email already exists.', 409);
    }

    // Account exists but is unverified — allow re-registration:
    // update password, resend OTP (clean up stale OTPs first)
    await existing.setPassword(password);
    await existing.save();

    await OTP.deleteMany({ email, type: 'EMAIL_VERIFICATION' });

    let emailSent = true;
    try {
      await createAndSendOTP(email, 'EMAIL_VERIFICATION');
    } catch (emailErr) {
      emailSent = false;
      logger.error('Failed to send OTP during re-registration (account preserved)', {
        email,
        error: emailErr.message,
      });
    }

    logger.info('User re-registered (was unverified)', {
      userId: existing._id,
      role,
      emailSent,
    });
    return {
      userId: existing._id,
      email: existing.email,
      role: existing.role,
      emailSent,
    };
  }

  // Brand-new user — create the account first, then attempt to send the OTP.
  // If the email fails, DO NOT roll back the user. Preserve the account and
  // the OTP record so the user can retry via the "Resend OTP" button on the
  // verify-email page without re-filling the entire registration form.
  await OTP.deleteMany({ email, type: 'EMAIL_VERIFICATION' });

  const user = new User({ email, role });
  await user.setPassword(password);
  await user.save();

  let emailSent = true;
  try {
    await createAndSendOTP(email, 'EMAIL_VERIFICATION');
  } catch (emailErr) {
    emailSent = false;
    logger.error('OTP email failed — account preserved for retry', {
      email,
      userId: user._id,
      error: emailErr.message,
    });
  }

  logger.info('User registered', { userId: user._id, role, emailSent });
  return { userId: user._id, email: user.email, role: user.role, emailSent };
}

async function verifyEmail({ email, otp }) {
  await verifyOTP(email, otp, 'EMAIL_VERIFICATION');

  const user = await User.findOneAndUpdate(
    { email },
    { isEmailVerified: true },
    { new: true }
  );

  if (!user) throw AppError('User not found.', 404);

  logger.info('Email verified', { userId: user._id });
  return user;
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select(
    '+passwordHash +loginAttempts +lockUntil +refreshTokens'
  );

  if (!user || !user.isActive) {
    throw AppError('Invalid credentials.', 401);
  }

  if (user.isLocked) {
    const remainingMs = user.lockUntil - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60_000);
    throw AppError(
      `Account temporarily locked. Try again in ${remainingMin} minute(s).`,
      423
    );
  }

  if (!user.isEmailVerified) {
    throw AppError('Please verify your email before logging in.', 403);
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    await user.incLoginAttempts();
    throw AppError('Invalid credentials.', 401);
  }

  await user.resetLoginAttempts();

  const { accessToken, refreshToken } = buildTokenPair(user);

  const hashedRefresh = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT);
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: { $each: [hashedRefresh], $slice: -10 } } } // keep last 10
  );

  logger.info('User logged in', { userId: user._id });
  return { accessToken, refreshToken, user };
}

async function refreshTokens(incomingRefreshToken) {
  let payload;
  try {
    payload = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw AppError('Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.isActive) {
    throw AppError('User not found or deactivated.', 401);
  }

  let tokenIndex = -1;
  for (let i = 0; i < user.refreshTokens.length; i++) {
    const match = await bcrypt.compare(incomingRefreshToken, user.refreshTokens[i]);
    if (match) { tokenIndex = i; break; }
  }

  if (tokenIndex === -1) {
    await User.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });
    logger.warn('Refresh token reuse detected — all sessions invalidated', { userId: user._id });
    throw AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = buildTokenPair(user);
  const hashedNew = await bcrypt.hash(newRefreshToken, REFRESH_TOKEN_SALT);

  const updatedTokens = [...user.refreshTokens];
  updatedTokens[tokenIndex] = hashedNew;
  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: updatedTokens } });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(userId, refreshToken) {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;

  const surviving = [];
  for (const stored of user.refreshTokens) {
    const match = await bcrypt.compare(refreshToken, stored);
    if (!match) surviving.push(stored);
  }

  await User.updateOne({ _id: userId }, { $set: { refreshTokens: surviving } });
  logger.info('User logged out (session removed)', { userId });
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (user && user.isActive && user.isEmailVerified) {
    try {
      await createAndSendOTP(email, 'PASSWORD_RESET');
    } catch (emailErr) {
      logger.error('Failed to send password-reset OTP', {
        email,
        error: emailErr.message,
      });
    }
  }
  logger.info('Forgot-password requested', { email });
}

async function verifyPasswordResetOTP({ email, otp }) {
  await verifyOTP(email, otp, 'PASSWORD_RESET');

  const sessionId = uuidv4();
  await User.updateOne({ email }, { passwordResetSessionId: sessionId });

  logger.info('Password reset OTP verified', { email });
  return { resetSessionId: sessionId };
}

async function resetPassword({ email, resetSessionId, newPassword }) {
  const user = await User.findOne({ email }).select('+passwordResetSessionId');
  if (!user || user.passwordResetSessionId !== resetSessionId) {
    throw AppError('Invalid or expired password reset session.', 400);
  }

  await user.setPassword(newPassword);
  user.passwordResetSessionId = undefined;
  user.refreshTokens = [];
  await user.save();

  logger.info('Password reset successfully', { userId: user._id });
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshTokens,
  logout,
  forgotPassword,
  verifyPasswordResetOTP,
  resetPassword,
};
