import { getStoredToken } from "./authStorage.js";
import { CORE_API_BASE } from "./serviceConfig.js";

const JAVA_BASE = CORE_API_BASE;

function getToken() {
  return getStoredToken();
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't force Content-Type for FormData — browser sets the boundary automatically
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${JAVA_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    let message;
    try {
      const json = JSON.parse(text);
      // Handle Spring Boot validation errors
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
