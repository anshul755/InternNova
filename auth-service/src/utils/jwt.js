const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '7d';

/**
 * Signs a short-lived access token.
 * Payload carries userId, email, role — nothing sensitive.
 */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: 'HS256',
  });
}

/**
 * Signs a long-lived refresh token.
 */
function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
    algorithm: 'HS256',
  });
}

/**
 * Verifies an access token. Throws jwt.JsonWebTokenError on failure.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
}

/**
 * Verifies a refresh token. Throws on failure.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
}

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
