const mongoose = require('mongoose');

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes
const MAX_OTP_ATTEMPTS = 3;

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET'],
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index — auto-deletes expired documents
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Compound index to quickly fetch the latest OTP for an email+type
OTPSchema.index({ email: 1, type: 1 });

OTPSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

OTPSchema.virtual('isExhausted').get(function () {
  return this.attempts >= MAX_OTP_ATTEMPTS;
});

const OTP = mongoose.model('OTP', OTPSchema);
module.exports = { OTP, OTP_TTL_SECONDS, MAX_OTP_ATTEMPTS };
