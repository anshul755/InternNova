const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate, authenticateSoft } = require('../middleware/auth.middleware');
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


router.post('/register',       generalLimiter, validateRegister,      controller.register);
router.post('/verify-email',   otpLimiter,     validateVerifyEmail,   controller.verifyEmail);
router.post('/resend-otp',     otpLimiter,     validateResendOTP,     controller.resendOTP);


router.post('/login',          loginLimiter,   validateLogin,         controller.login);
router.post('/refresh',        generalLimiter,                        controller.refresh);
router.post('/logout',         authenticate,                          controller.logout);
router.get('/me',              authenticateSoft,                      controller.getCurrentUser);


router.post('/forgot-password',    otpLimiter,     validateForgotPassword,    controller.forgotPassword);
router.post('/verify-reset-otp',   otpLimiter,     validateVerifyResetOTP,    controller.verifyResetOTP);
router.post('/reset-password',     generalLimiter, validateResetPassword,     controller.resetPassword);

module.exports = router;
