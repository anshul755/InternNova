const { validationResult, body } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after express-validator chain — collects errors and short-circuits.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return sendError(res, 422, 'Validation failed.', formatted);
  }
  next();
}

// ── Shared reusable rules ──────────────────────────────────────────────────────

const emailRule = () =>
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail()
    .isLength({ max: 254 }).withMessage('Email is too long.');

const passwordRule = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character.');

const otpRule = () =>
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required.')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits.')
    .isNumeric().withMessage('OTP must contain only digits.');

// ── Validation chains per endpoint ────────────────────────────────────────────

const validateRegister = [
  emailRule(),
  passwordRule(),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['Talent', 'Company']).withMessage('Role must be Talent or Company.'),
  handleValidation,
];

const validateVerifyEmail = [emailRule(), otpRule(), handleValidation];

const validateResendOTP = [
  emailRule(),
  body('type')
    .notEmpty().withMessage('OTP type is required.')
    .isIn(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).withMessage('Invalid OTP type.'),
  handleValidation,
];

const validateLogin = [emailRule(), passwordRule(), handleValidation];

const validateForgotPassword = [emailRule(), handleValidation];

const validateVerifyResetOTP = [emailRule(), otpRule(), handleValidation];

const validateResetPassword = [
  emailRule(),
  body('resetSessionId').notEmpty().withMessage('Reset session ID is required.').isUUID(),
  passwordRule('newPassword'),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateVerifyEmail,
  validateResendOTP,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetOTP,
  validateResetPassword,
};
