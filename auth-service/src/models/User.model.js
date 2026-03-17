const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000;

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['Talent', 'Company', 'Admin'],
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetSessionId: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.passwordResetSessionId;
        return ret;
      },
    },
  }
);

UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.methods.setPassword = async function (plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

UserSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME_MS) };
  }
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 },
  });
};

const User = mongoose.model('AuthUser', UserSchema, 'authUsers');
module.exports = User;
