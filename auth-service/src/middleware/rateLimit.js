
const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

function makeRateLimiter({ windowMinutes, max, message }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, message),
    // Key by IP (express-rate-limit default)
    skip: () => process.env.NODE_ENV === 'test',
  });
}

/** Strict limiter for login — 10 attempts per 15 minutes per IP */
const loginLimiter = makeRateLimiter({
  windowMinutes: 15,
  max: 10,
  message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
});

/** Moderate limiter for OTP endpoints — 5 requests per 10 minutes per IP */
const otpLimiter = makeRateLimiter({
  windowMinutes: 10,
  max: 5,
  message: 'Too many OTP requests. Please wait before requesting another.',
});

/** General auth endpoints — 20 requests per 15 minutes */
const generalLimiter = makeRateLimiter({
  windowMinutes: 15,
  max: 20,
  message: 'Too many requests. Please slow down.',
});

module.exports = { loginLimiter, otpLimiter, generalLimiter };
