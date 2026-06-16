import { getStoredToken, getStoredRefreshToken, setStoredToken, clearStoredToken } from "./authStorage.js";
import { AUTH_API_BASE, CORE_API_BASE } from "./serviceConfig.js";

const JAVA_BASE = CORE_API_BASE;
const AUTH_BASE = AUTH_API_BASE;

function getToken() {
  return getStoredToken();
}

// ── Token refresh ────────────────────────────────────────────────────────────

let refreshPromise = null;

async function refreshAccessToken() {
  try {
    console.log("[api] Attempting token refresh via cookie");
    const res = await fetch(`${AUTH_BASE}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[api] Refresh endpoint returned", res.status, errText);
      throw new Error("refresh failed");
    }
    console.log("[api] Token refresh successful");
    return true;
  } catch (e) {
    console.error("[api] Refresh failed:", e.message);
    clearStoredToken();
    throw new Error("Session expired. Please log in again.");
  }
}

async function getRefreshedToken() {
  // Deduplicate concurrent refresh calls — only one in-flight at a time
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Request ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${JAVA_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const isLoggedIn = localStorage.getItem("inn_logged_in") === "true";

  // If 401 and we are logged in, try refreshing it once
  if (res.status === 401 && isLoggedIn) {
    console.log("[api] Got 401 on", path, "— attempting refresh");
    try {
      await getRefreshedToken();
      console.log("[api] Retrying", path, "with refreshed cookies");
      res = await fetch(`${JAVA_BASE}${path}`, {
        credentials: "include",
        ...options,
        headers,
      });
      if (res.status === 401) {
        console.error("[api] Retry also got 401");
        const retryText = await res.text();
        console.error("[api] 401 response body:", retryText);
      }
    } catch (refreshErr) {
      // Refresh failed — clear token so the app knows the session is over
      clearStoredToken();
      throw refreshErr;
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let message;
    try {
      const json = JSON.parse(text);
      if (json.errors && Array.isArray(json.errors)) {
        message = json.errors.map(e => e.defaultMessage || e.message).join(', ');
      } else {
        message = json.message || json.error;
      }
    } catch {
      message = text;
    }
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return res;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),

  post: (path, body, options) =>
    request(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (path, body, options) =>
    request(path, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
