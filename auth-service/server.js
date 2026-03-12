'use strict';

require('dotenv').config();

const { validateEnv } = require('./src/config/env');
validateEnv();

const http = require('http');
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5001;

let server;
let isShuttingDown = false;
let forceShutdownTimer;

async function bootstrap() {
  await connectDB();

  server = http.createServer(app);

  server.listen(PORT, () => {
    logger.info(`Auth service running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  server.on('error', (err) => {
    logger.error('Server error', { error: err.message });
    process.exit(1);
  });
}

// ── Graceful shutdown ──────────────────────────────────────────────────────────
function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) {
    logger.info(`Shutdown already in progress (${signal})`);
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received — shutting down gracefully`);

  forceShutdownTimer = setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceShutdownTimer.unref();

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectDB();
        logger.info('MongoDB connection closed');
        clearTimeout(forceShutdownTimer);
        process.exit(exitCode);
      } catch (err) {
        logger.error('Error while closing MongoDB connection', { error: err.message });
        clearTimeout(forceShutdownTimer);
        process.exit(1);
      }
    });
  } else {
    clearTimeout(forceShutdownTimer);
    process.exit(exitCode);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: String(reason) });
  shutdown('unhandledRejection', 1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
  shutdown('uncaughtException', 1);
});

bootstrap();
