const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const logger = require('./utils/logger');
const { sendError } = require('./utils/response');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(helmet());
app.use(cookieParser());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);


app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
});


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));


if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: (_req, res) => res.statusCode < 400,
    })
  );
}


app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'auth-service', ts: new Date().toISOString() })
);


app.use('/auth/v1', authRoutes);


app.use((req, res) => {
  sendError(res, 404, 'Route not found');
});


app.use((err, req, res, _next) => {

  if (err.message && err.message.startsWith('CORS:')) {
    return sendError(res, 403, err.message);
  }

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON payload');
  }

  logger.error('Unhandled application error', {
    reqId: req.id,
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const errMessage = String(err.message || '');
  const isDatabaseNetworkError =
    err.name === 'MongoNetworkError' ||
    errMessage.includes('getaddrinfo') ||
    errMessage.includes('ENOTFOUND') ||
    errMessage.includes('querySrv') ||
    errMessage.includes('server selection timed out');

  if (isDatabaseNetworkError) {
    return sendError(
      res,
      503,
      'Database connection is temporarily unavailable. Please try again.'
    );
  }

  const statusCode = err.statusCode || err.status || 500;

  const isProduction = process.env.NODE_ENV === 'production';
  const isUnexpectedError = statusCode === 500;
  const message = isProduction && isUnexpectedError
    ? 'Internal server error'
    : err.message;

  sendError(res, statusCode, message);
});

module.exports = app;
