'use strict';

const crypto = require('crypto');

const OTP_LENGTH = 6; // digits

/**
 * Generates a cryptographically-secure numeric OTP.
 * Uses crypto.randomInt to avoid biased results.
 */
function generateOTP() {
  // crypto.randomInt(min, max) → [min, max)
  const min = Math.pow(10, OTP_LENGTH - 1); // 100000
  const max = Math.pow(10, OTP_LENGTH);     // 1000000
  return String(crypto.randomInt(min, max));
}

module.exports = { generateOTP };
