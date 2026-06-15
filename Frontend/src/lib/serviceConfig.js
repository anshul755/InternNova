// In development, Vite reads from frontend/.env (default: http://localhost:4000)
// In production, Cloudflare Pages overrides VITE_API_GATEWAY_URL to https://api.internnova.com
const GATEWAY = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:4000";

export const SERVICE_BASE_URLS = {
  AUTH: GATEWAY,
  CORE: GATEWAY,
};

export const AUTH_API_BASE = `${GATEWAY}/auth/v1`;
export const CORE_API_BASE = GATEWAY;
