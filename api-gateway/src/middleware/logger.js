import { isDev } from "../config.js";

/**
 * Tiny request logger for the gateway.
 *
 * Logs method, path, status, and elapsed time.  In development the body
 * size is also included; sensitive headers / bodies are never logged.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function now() {
  return new Date().toISOString();
}

function colorStatus(code) {
  if (code >= 500) return `\x1b[31m${code}\x1b[0m`; // red
  if (code >= 400) return `\x1b[33m${code}\x1b[0m`; // yellow
  if (code >= 300) return `\x1b[36m${code}\x1b[0m`; // cyan
  return `\x1b[32m${code}\x1b[0m`; // green
}

export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log after response completes
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    const status = res.statusCode;
    const colored = isDev ? colorStatus(status) : status;

    const parts = [
      `[${now()}]`,
      req.method,
      req.originalUrl || req.url,
      colored,
      `${elapsed}ms`,
    ];

    if (isDev) {
      const contentLength = res.getHeader("content-length");
      if (contentLength) parts.push(`${(Number(contentLength) / 1024).toFixed(1)}KB`);
    }

    console.log(parts.join(" "));
  });

  next();
}
