const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');


async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register({ email, password, role });
    sendSuccess(
      res,
      201,
      'Registration successful. Please check your email for the verification OTP.',
      result
    );
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/verify-email ────────────────────────────────────────────────
async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await authService.verifyEmail({ email, otp });
    sendSuccess(res, 200, 'Email verified successfully.', { userId: user._id, role: user.role });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/resend-otp ──────────────────────────────────────────────────
async function resendOTP(req, res, next) {
  try {
    const { email, type } = req.body;
    const { createAndSendOTP } = require('../services/otp.service');
    await createAndSendOTP(email, type);
    sendSuccess(res, 200, 'A new OTP has been sent to your email.');
  } catch (err) {
    next(err);
  }
}


async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login({ email, password });

    // Send refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/v1/refresh',
    });

    sendSuccess(res, 200, 'Login successful.', {
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}


async function refresh(req, res, next) {
  try {
    // Accept from cookie (web) or body (mobile)
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) {
      return sendError(res, 400, 'Refresh token is required.');
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(
      incomingToken
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/v1/refresh',
    });

    sendSuccess(res, 200, 'Token refreshed.', { accessToken });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/logout ──────────────────────────────────────────────────────
async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken && req.user?.sub) {
      await authService.logout(req.user.sub, refreshToken);
    }

    res.clearCookie('refreshToken', { path: '/auth/v1/refresh' });
    sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/forgot-password ─────────────────────────────────────────────
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    // Always return 200 — do not leak whether the email exists
    sendSuccess(
      res,
      200,
      'If an account with that email exists, a password reset OTP has been sent.'
    );
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/verify-reset-otp ───────────────────────────────────────────
async function verifyResetOTP(req, res, next) {
  try {
    const { email, otp } = req.body;
    const { resetSessionId } = await authService.verifyPasswordResetOTP({ email, otp });
    sendSuccess(res, 200, 'OTP verified. You may now reset your password.', { resetSessionId });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/v1/reset-password ──────────────────────────────────────────────
async function resetPassword(req, res, next) {
  try {
    const { email, resetSessionId, newPassword } = req.body;
    await authService.resetPassword({ email, resetSessionId, newPassword });
    res.clearCookie('refreshToken', { path: '/auth/v1/refresh' });
    sendSuccess(res, 200, 'Password has been reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyEmail,
  resendOTP,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};
