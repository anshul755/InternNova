const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

function isTransientMongoNetworkError(err) {
  const message = String(err?.message || '');
  return (
    err?.name === 'MongoNetworkError' ||
    message.includes('getaddrinfo') ||
    message.includes('ENOTFOUND') ||
    message.includes('querySrv') ||
    message.includes('server selection timed out')
  );
}

async function retryTransientMongo(operation) {
  try {
    return await operation();
  } catch (err) {
    if (!isTransientMongoNetworkError(err)) {
      throw err;
    }

    logger.warn('Transient MongoDB network error, retrying once', {
      error: err.message,
    });
    await new Promise((resolve) => setTimeout(resolve, 750));
    return operation();
  }
}


async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register({ email, password, role });

    const message = result.emailSent === false
      ? 'Account created, but the verification email could not be sent right now. You can request a new OTP from the verification page.'
      : 'Registration successful. Please check your email for the verification OTP.';

    sendSuccess(res, 201, message, result);
  } catch (err) {
    next(err);
  }
}


async function verifyEmail(req, res, next) {
  try {
    const { email, otp } = req.body;
    const user = await authService.verifyEmail({ email, otp });
    sendSuccess(res, 200, 'Email verified successfully.', { userId: user._id, role: user.role });
  } catch (err) {
    next(err);
  }
}

async function resendOTP(req, res, next) {
  try {
    const { email, type } = req.body;
    const { createAndSendOTP } = require('../services/otp.service');

    let emailSent = true;
    try {
      await createAndSendOTP(email, type);
    } catch (emailErr) {
      emailSent = false;
      logger.warn('Resend OTP email failed', {
        email,
        type,
        error: emailErr.message,
      });
    }

    const message = emailSent
      ? 'A new OTP has been sent to your email.'
      : 'A new verification code has been generated, but the email could not be sent. Please try again in a moment.';

    sendSuccess(res, 200, message, { emailSent });
  } catch (err) {
    next(err);
  }
}


async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await retryTransientMongo(() =>
      authService.login({ email, password })
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      maxAge: 15 * 60 * 1000, // 15 mins
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    sendSuccess(res, 200, 'Login successful.', {
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}


async function refresh(req, res, next) {
  try {
    const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingToken) {
      return res.status(200).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token. Please log in.',
      });
    }

    try {
      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(
        incomingToken
      );

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 15 * 60 * 1000, // 15 mins
        path: '/',
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      sendSuccess(res, 200, 'Token refreshed.', { accessToken });
    } catch (refreshErr) {
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return res.status(200).json({
        success: false,
        code: 'REFRESH_FAILED',
        message: refreshErr.message || 'Token refresh failed.',
      });
    }
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken && req.user?.sub) {
      await authService.logout(req.user.sub, refreshToken);
    }

    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);

    sendSuccess(
      res,
      200,
      'If an account with that email exists, a password reset OTP has been sent.'
    );
  } catch (err) {
    next(err);
  }
}

async function verifyResetOTP(req, res, next) {
  try {
    const { email, otp } = req.body;
    const { resetSessionId } = await authService.verifyPasswordResetOTP({ email, otp });
    sendSuccess(res, 200, 'OTP verified. You may now reset your password.', { resetSessionId });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, resetSessionId, newPassword } = req.body;
    await authService.resetPassword({ email, resetSessionId, newPassword });
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    sendSuccess(res, 200, 'Password has been reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: false,
        code: req.authError || 'UNAUTHENTICATED',
        message: 'User not authenticated.',
      });
    }
    sendSuccess(res, 200, 'Current user retrieved successfully.', {
      user: { id: req.user.sub, email: req.user.email, role: req.user.role },
    });
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
  getCurrentUser,
};
