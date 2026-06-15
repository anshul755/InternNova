import "dotenv/config";

/**
 * Centralised configuration for the API Gateway.
 *
 * Reads from environment / .env file.  Every value has a sensible default
 * so the gateway can start even when no .env is present.
 */

export const config = {
  // ── Gateway ──────────────────────────────────────────────────────────────
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4000,

  // ── Backend service URLs ─────────────────────────────────────────────────
  services: {
    auth: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
    core: process.env.CORE_SERVICE_URL || "http://localhost:8080",
    ai: process.env.AI_SERVICE_URL || "http://localhost:8000",
  },

  // ── Health-check paths (per-service, Spring Boot uses /actuator/health) ───
  healthPaths: {
    auth: "/health",
    core: "/actuator/health",
    ai: "/health",
  },

  // ── CORS ─────────────────────────────────────────────────────────────────
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // ── Rate limiting ────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 200,
  },

  // ── Logging ──────────────────────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || "debug",
};

/** Quick check helpers */
export const isDev = config.nodeEnv === "development";
export const isProd = config.nodeEnv === "production";
