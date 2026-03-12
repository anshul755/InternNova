const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { loginLimiter, otpLimiter, generalLimiter } = require('../middleware/rateLimit');
const {
  validateRegister,
  validateVerifyEmail,
  validateResendOTP,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetOTP,
  validateResetPassword,
} = require('../middleware/validate');

const router = Router();

// ── Registration & email verification ────────────────────────────────────────
router.post('/register',       generalLimiter, validateRegister,      controller.register);
router.post('/verify-email',   otpLimiter,     validateVerifyEmail,   controller.verifyEmail);
router.post('/resend-otp',     otpLimiter,     validateResendOTP,     controller.resendOTP);

// ── Session management ────────────────────────────────────────────────────────
router.post('/login',          loginLimiter,   validateLogin,         controller.login);
router.post('/refresh',        generalLimiter,                        controller.refresh);
router.post('/logout',         authenticate,                          controller.logout);

// ── Password reset flow ───────────────────────────────────────────────────────
router.post('/forgot-password',    otpLimiter,     validateForgotPassword,    controller.forgotPassword);
router.post('/verify-reset-otp',   otpLimiter,     validateVerifyResetOTP,    controller.verifyResetOTP);
router.post('/reset-password',     generalLimiter, validateResetPassword,     controller.resetPassword);

module.exports = router;
