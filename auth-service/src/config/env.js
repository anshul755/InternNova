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

  const secrets = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of secrets) {
    if (process.env[key].length < 32) {
      throw new Error(`${key} must be at least 32 characters long.`);
    }
  }
}

module.exports = { validateEnv };
