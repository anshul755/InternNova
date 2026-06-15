const PRIMARY_TOKEN_KEY = "inn_access_token";
const REFRESH_TOKEN_KEY = "inn_refresh_token";
const TOKEN_KEYS = [PRIMARY_TOKEN_KEY, "authToken", "token"];

export function getStoredToken() {
  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  return null;
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredToken(token) {
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  for (const key of TOKEN_KEYS) {
    if (key !== PRIMARY_TOKEN_KEY) {
      localStorage.removeItem(key);
    }
  }
}

export function setStoredRefreshToken(refreshToken) {
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearStoredToken() {
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
