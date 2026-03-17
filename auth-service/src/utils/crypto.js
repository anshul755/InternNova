const crypto = require('crypto');

const OTP_LENGTH = 6;

function generateOTP() {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH);
  return String(crypto.randomInt(min, max));
}

module.exports = { generateOTP };
