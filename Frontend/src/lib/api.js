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
    const storedRefresh = getStoredRefreshToken();
    console.log("[api] Attempting token refresh — storedRefresh:", storedRefresh ? "present" : "missing");
    const res = await fetch(`${AUTH_BASE}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: storedRefresh ? JSON.stringify({ refreshToken: storedRefresh }) : undefined,
      credentials: "include",
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("[api] Refresh endpoint returned", res.status, errText);
      throw new Error("refresh failed");
    }
    const body = await res.json();
    console.log("[api] Refresh response:", body);
    const newToken = body?.data?.accessToken;
    if (!newToken) throw new Error("no access token in refresh response");
    setStoredToken(newToken);
    console.log("[api] New access token stored, length:", newToken.length);
    return newToken;
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
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${JAVA_BASE}${path}`, { ...options, headers });

  // If 401 and we had a token, try refreshing it once
  if (res.status === 401 && token) {
    console.log("[api] Got 401 on", path, "— attempting refresh");
    try {
      const newToken = await getRefreshedToken();
      headers["Authorization"] = `Bearer ${newToken}`;
      console.log("[api] Retrying", path, "with refreshed token");
      res = await fetch(`${JAVA_BASE}${path}`, { ...options, headers });
      if (res.status === 401) {
        console.error("[api] Retry also got 401 — token may be invalid or secret mismatch");
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
