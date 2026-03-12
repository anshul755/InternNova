'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const logger = require('./utils/logger');
const { sendError } = require('./utils/response');
const authRoutes = require('./routes/auth.routes');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server requests (no origin) in non-production, or whitelisted
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  })
);

// ── Request ID ────────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
});

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── HTTP logging ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
      skip: (_req, res) => res.statusCode < 400,
    })
  );
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'auth-service', ts: new Date().toISOString() })
);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/auth/v1', authRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  sendError(res, 404, 'Route not found');
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message && err.message.startsWith('CORS:')) {
    return sendError(res, 403, err.message);
  }

  // JSON parse errors
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

  const statusCode = err.statusCode || err.status || 500;
  sendError(
    res,
    statusCode,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  );
});

module.exports = app;
