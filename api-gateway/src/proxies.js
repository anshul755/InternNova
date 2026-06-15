import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import { config, isDev } from "./config.js";

/**
 * Every proxy route that the gateway exposes.
 *
 * Each entry maps an incoming URL prefix to a backend service.  The proxy
 * middleware forwards:
 *  - method, headers (including Authorization), query string, body
 *  - multipart/form-data (file uploads) — transparent passthrough
 *
 * The middleware is registered WITHOUT Express mount paths so that
 * req.url stays intact.  Instead we use http-proxy-middleware's own
 * `pathFilter` to decide which backend handles the request.
 *
 * Health endpoints are handled directly by the gateway (not proxied).
 */

/** Shared proxy options applied to every route */
function proxyOptions(target, pathFilter) {
  return {
    target,
    changeOrigin: true,
    // Preserve original host header so backend can log real origin if needed
    // but rewrite Origin so CORS on backends won't reject.
    xfwd: true,
    // Timeout: the AI evaluation on application submission can take up to ~90 s
    // (PDF download + parse + LLM shortlist). Match the core-service's RestClient
    // read timeout so we don't 502 before the backend responds.
    proxyTimeout: 90_000,
    timeout: 90_000,

    // Narrow requests to only those matching this route's prefix.
    // Using pathFilter (instead of Express mount paths) prevents Express
    // from stripping the prefix from req.url.
    pathFilter,

    // Event handlers
    on: {
      // Fix request body: express.json() in server.js consumes the raw body
      // stream.  Without this, POST/PUT/PATCH requests arrive at the backend
      // with an empty body — causing ERR_EMPTY_RESPONSE or validation errors.
      proxyReq: fixRequestBody,

      // Return a proper error response when the backend is unreachable,
      // instead of dropping the connection (which causes ERR_EMPTY_RESPONSE).
      error(err, req, res) {
        const msg = isDev ? err.message : "Backend unreachable";
        console.error(
          `[proxy-error] ${req.method} ${req.originalUrl || req.url}: ${err.message}`
        );

        // Only send an error response if headers haven't been sent yet
        if (res.headersSent) return;

        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            message: msg,
          })
        );
      },
    },
  };
}

/**
 * Route table.
 *
 * Route shape:
 *   prefix     – URL path prefix to match (used as pathFilter)
 *   target     – backend base URL (without path suffix)
 *   auth       – (unused placeholder, kept for compatibility with future JWT gate)
 */
export const proxyRoutes = [
  // ── Auth service ─────────────────────────────────────────────────────────
  {
    prefix: "/auth",
    target: config.services.auth,
    auth: false,
  },

  // ── Core service (Spring Boot) ───────────────────────────────────────────
  {
    prefix: "/applications",
    target: config.services.core,
    auth: true,
  },
  {
    prefix: "/jobs",
    target: config.services.core,
    auth: true,
  },
  {
    prefix: "/company",
    target: config.services.core,
    auth: true,
  },
  {
    prefix: "/talent",
    target: config.services.core,
    auth: true,
  },

  // ── AI service (FastAPI) ─────────────────────────────────────────────────
  {
    prefix: "/pipeline",
    target: config.services.ai,
    auth: true,
  },
];

/**
 * Register every proxy route on `app`.
 *
 * Each proxy is mounted globally (app.use(middleware)) so that Express
 * does NOT strip the prefix from req.url.  The `pathFilter` option
 * inside the proxy ensures only matching requests are forwarded.
 */
export function registerProxies(app) {
  for (const route of proxyRoutes) {
    const middleware = createProxyMiddleware({
      ...proxyOptions(route.target, route.prefix),
    });

    // Mount globally — pathFilter handles which requests reach this proxy
    app.use(middleware);

    console.log(
      `  [proxy] ${route.prefix}/*  →  ${route.target}${route.prefix}/*`
    );
  }
}
