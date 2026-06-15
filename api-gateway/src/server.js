/**
 * InternNova API Gateway — single entry point for the frontend.
 *
 * Routes:
 *   /auth/*          → auth-service   (Express, port 5001)
 *   /applications/*  → core-service   (Spring Boot, port 8080)
 *   /jobs/*          → core-service
 *   /company/*       → core-service
 *   /talent/*        → core-service
 *   /pipeline/*      → ai-service     (FastAPI, port 8000)
 *   /health           → gateway health + downstream service status
 *
 * Start:  npm start        (or  npm run dev  for watch mode)
 */

import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config, isDev } from "./config.js";
import { registerProxies } from "./proxies.js";
import { requestLogger } from "./middleware/logger.js";
import { globalLimiter } from "./middleware/rateLimit.js";

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------
const app = express();

// Security headers (relaxed a little so proxied services don't conflict)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
  })
);

// CORS — allow the frontend origin(s)
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || config.allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  })
);

// Body parsing — needed before proxies so the gateway can inspect the body
// if needed (e.g. for logging / validation).  http-proxy-middleware will
// re-serialize it when forwarding.
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Request ID & logger
app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"] || `gw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  next();
});
app.use(requestLogger);

// Global rate limiter
app.use(globalLimiter);

// Trust proxy — required when running behind a reverse proxy / load balancer.
// The gateway IS the entry point so this is less critical, but it's safe.
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// Health endpoint — gateway + downstream reachability
// ---------------------------------------------------------------------------
app.get("/health", async (_req, res) => {
  const services = {};

  // Probe each backend in parallel
  const probes = Object.entries(config.services).map(async ([name, url]) => {
    try {
      const healthPath = config.healthPaths[name] || "/health";
      const resp = await fetch(`${url}${healthPath}`, { signal: AbortSignal.timeout(3000) });
      services[name] = resp.ok ? "ok" : `degraded (HTTP ${resp.status})`;
    } catch {
      services[name] = "unreachable";
    }
  });

  await Promise.allSettled(probes);

  const allUp = Object.values(services).every((s) => s === "ok");

  res.status(allUp ? 200 : 503).json({
    status: allUp ? "ok" : "degraded",
    service: "api-gateway",
    version: "1.0.0",
    ts: new Date().toISOString(),
    services,
  });
});

// ---------------------------------------------------------------------------
// Proxy routes
// ---------------------------------------------------------------------------
registerProxies(app);

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err.message?.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON payload" });
  }

  console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
  if (isDev) console.error(err.stack);

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: isDev ? err.message : "Internal server error",
  });
});

// ---------------------------------------------------------------------------
// Server bootstrap & graceful shutdown
// ---------------------------------------------------------------------------
const PORT = config.port;
let server;
let isShuttingDown = false;

function start() {
  server = createServer(app);

  server.listen(PORT, () => {
    console.log("");
    console.log(`  API Gateway running on http://localhost:${PORT}  [${config.nodeEnv}]`);
    console.log(`  Health check:  http://localhost:${PORT}/health`);
    console.log("");
    console.log("  Proxied routes:");
    console.log(`    /auth/*          →  ${config.services.auth}`);
    console.log(`    /applications/*  →  ${config.services.core}`);
    console.log(`    /jobs/*          →  ${config.services.core}`);
    console.log(`    /company/*       →  ${config.services.core}`);
    console.log(`    /talent/*        →  ${config.services.core}`);
    console.log(`    /pipeline/*      →  ${config.services.ai}`);
    console.log("");
  });

  server.on("error", (err) => {
    console.error("Server error:", err.message);
    process.exit(1);
  });
}

function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received — shutting down gateway…`);

  const forceExit = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  if (server) {
    server.close(() => {
      clearTimeout(forceExit);
      console.log("Gateway closed.");
      process.exit(0);
    });
  } else {
    clearTimeout(forceExit);
    process.exit(0);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.message);
  console.error(err.stack);
  shutdown("uncaughtException");
});

// ── Go! ────────────────────────────────────────────────────────────────────
start();
