'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const IS_PROD = process.env.NODE_ENV === 'production';

// Simple human-readable format for development
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${stack || message}${metaStr}`;
  })
);

// Structured JSON format for production
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const transports = [new winston.transports.Console()];

if (IS_PROD) {
  const logDir = process.env.LOG_DIR || path.join(__dirname, '../../logs');

  transports.push(
    new DailyRotateFile({
      dirname: logDir,
      filename: 'auth-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'auth-error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (IS_PROD ? 'info' : 'debug'),
  format: IS_PROD ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});

// Provide an http stream for morgan
logger.http = (message) => logger.verbose(message);

module.exports = logger;
