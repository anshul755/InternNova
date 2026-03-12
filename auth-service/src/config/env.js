'use strict';

/**
 * Validates all required environment variables at startup.
 * Throws immediately if any required variable is missing.
 */

const REQUIRED = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
];

function validateEnv() {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'See .env.example for the full list.'
    );
  }

  // Validate JWT secrets are strong enough (≥ 32 chars)
  const secrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of secrets) {
    if (process.env[key].length < 32) {
      throw new Error(`${key} must be at least 32 characters long.`);
    }
  }
}

module.exports = { validateEnv };
