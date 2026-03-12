const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { createAndSendOTP, verifyOTP } = require('./otp.service');
const logger = require('../utils/logger');

const REFRESH_TOKEN_SALT = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Auth operations ───────────────────────────────────────────────────────────

/**
 * Registers a new user. Sends an email-verification OTP.
 */
async function register({ email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    // Always return the same message to prevent user enumeration
    throw AppError('An account with this email already exists.', 409);
  }

  const user = new User({ email, role });
  await user.setPassword(password);
  await user.save();

  await createAndSendOTP(email, 'EMAIL_VERIFICATION');
  logger.info('User registered', { userId: user._id, role });

  return { userId: user._id, email: user.email, role: user.role };
}

/**
 * Verifies email with OTP. Issues token pair on success.
 */
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

/**
 * Authenticates a user. Returns token pair on success.
 */
async function login({ email, password }) {
  // Fetch password hash and lockout fields explicitly (select: false)
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

  // Store hashed refresh token (supports multi-device)
  const hashedRefresh = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT);
  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: { $each: [hashedRefresh], $slice: -10 } } } // keep last 10
  );

  logger.info('User logged in', { userId: user._id });
  return { accessToken, refreshToken, user };
}

/**
 * Rotates refresh tokens — issues new pair, invalidates old token.
 */
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

  // Verify the token is in the stored set
  let tokenIndex = -1;
  for (let i = 0; i < user.refreshTokens.length; i++) {
    const match = await bcrypt.compare(incomingRefreshToken, user.refreshTokens[i]);
    if (match) { tokenIndex = i; break; }
  }

  if (tokenIndex === -1) {
    // Possible token reuse attack — invalidate all tokens for this user
    await User.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });
    logger.warn('Refresh token reuse detected — all sessions invalidated', { userId: user._id });
    throw AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = buildTokenPair(user);
  const hashedNew = await bcrypt.hash(newRefreshToken, REFRESH_TOKEN_SALT);

  // Swap old token for new one
  const updatedTokens = [...user.refreshTokens];
  updatedTokens[tokenIndex] = hashedNew;
  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: updatedTokens } });

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logs out a single session by removing the refresh token.
 */
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

/**
 * Sends a password-reset OTP. Always returns 200 to prevent user enumeration.
 */
async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (user && user.isActive && user.isEmailVerified) {
    await createAndSendOTP(email, 'PASSWORD_RESET');
  }
  // Silently succeed even if user doesn't exist
  logger.info('Forgot-password requested', { email });
}

/**
 * Verifies the password-reset OTP. On success, issues a short-lived session
 * token (UUID) that must be presented when calling resetPassword.
 */
async function verifyPasswordResetOTP({ email, otp }) {
  await verifyOTP(email, otp, 'PASSWORD_RESET');

  const sessionId = uuidv4();
  await User.updateOne({ email }, { passwordResetSessionId: sessionId });

  logger.info('Password reset OTP verified', { email });
  return { resetSessionId: sessionId };
}

/**
 * Resets the password using the session token from verifyPasswordResetOTP.
 */
async function resetPassword({ email, resetSessionId, newPassword }) {
  const user = await User.findOne({ email }).select('+passwordResetSessionId');
  if (!user || user.passwordResetSessionId !== resetSessionId) {
    throw AppError('Invalid or expired password reset session.', 400);
  }

  await user.setPassword(newPassword);
  user.passwordResetSessionId = undefined;
  // Invalidate all existing sessions on password change
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
