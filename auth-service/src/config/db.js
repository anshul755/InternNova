const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;
let listenersRegistered = false;
let intentionalDisconnect = false;

function registerConnectionListeners() {
  if (listenersRegistered) {
    return;
  }

  mongoose.connection.on('disconnected', () => {
    if (intentionalDisconnect) {
      logger.info('MongoDB disconnected');
      return;
    }

    logger.warn('MongoDB disconnected unexpectedly');
  });

  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
  listenersRegistered = true;
}

async function connectDB(retries = MAX_RETRIES) {
  const uri = process.env.MONGODB_URI;
  intentionalDisconnect = false;
  registerConnectionListeners();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'InternNova-Development',
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info('MongoDB connected');
      return;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed`, {
        error: err.message,
      });
      if (attempt === retries) {
        throw new Error(`Failed to connect to MongoDB after ${retries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  intentionalDisconnect = true;
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
