import rateLimit from "express-rate-limit";
import { config } from "../config.js";

/**
 * Global rate limiter applied to every incoming request.
 *
 * This is a broad safety net.  Individual services may apply stricter
 * limits on sensitive routes (e.g. auth login, OTP).
 */

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,  // draft-7: RateLimit-* headers
  legacyHeaders: false,   // don't send X-RateLimit-*
  skip: () => config.nodeEnv === "test",
  message: {
    success: false,
    message: "Too many requests — please slow down and try again later.",
  },
});
