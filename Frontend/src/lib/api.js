const JAVA_BASE = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("inn_access_token");
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
      message = JSON.parse(text).message;
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
