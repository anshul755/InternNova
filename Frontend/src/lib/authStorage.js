const PRIMARY_TOKEN_KEY = "inn_access_token";
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

export function setStoredToken(token) {
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  for (const key of TOKEN_KEYS) {
    if (key !== PRIMARY_TOKEN_KEY) {
      localStorage.removeItem(key);
    }
  }
}

export function clearStoredToken() {
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
}
