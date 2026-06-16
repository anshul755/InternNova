const PRIMARY_TOKEN_KEY = "inn_access_token";
const REFRESH_TOKEN_KEY = "inn_refresh_token";
const TOKEN_KEYS = [PRIMARY_TOKEN_KEY, "authToken", "token"];

export function getStoredToken() {
  return null;
}

export function getStoredRefreshToken() {
  return null;
}

export function setStoredToken(token) {
  // Cookies handle token storage now
}

export function setStoredRefreshToken(refreshToken) {
  // Cookies handle token storage now
}

export function clearStoredToken() {
  localStorage.removeItem("inn_access_token");
  localStorage.removeItem("inn_refresh_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
}
