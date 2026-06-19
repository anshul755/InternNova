const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authorization header missing or malformed.');
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token has expired. Please refresh your session.');
    }
    return sendError(res, 401, 'Invalid access token.');
  }
}

function authenticateSoft(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    req.authError = 'MISSING_TOKEN';
    return next();
  }

  const token = authHeader.slice(7);
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    req.user = null;
    if (err.name === 'TokenExpiredError') {
      req.authError = 'TOKEN_EXPIRED';
    } else {
      req.authError = 'INVALID_TOKEN';
    }
    next();
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action.');
    }
    next();
  };
}

module.exports = { authenticate, authenticateSoft, authorize };
