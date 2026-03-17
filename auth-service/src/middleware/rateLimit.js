
const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

function makeRateLimiter({ windowMinutes, max, message }) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => sendError(res, 429, message),
    skip: () => process.env.NODE_ENV === 'test',
  });
}

const loginLimiter = makeRateLimiter({
  windowMinutes: 15,
  max: 10,
  message: 'Too many login attempts from this IP. Please try again in 15 minutes.',
});

const otpLimiter = makeRateLimiter({
  windowMinutes: 10,
  max: 5,
  message: 'Too many OTP requests. Please wait before requesting another.',
});

const generalLimiter = makeRateLimiter({
  windowMinutes: 15,
  max: 20,
  message: 'Too many requests. Please slow down.',
});

module.exports = { loginLimiter, otpLimiter, generalLimiter };
