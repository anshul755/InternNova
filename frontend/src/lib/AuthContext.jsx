import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStoredToken, setStoredToken, setStoredRefreshToken, clearStoredToken } from "./authStorage.js";
import { AUTH_API_BASE } from "./serviceConfig.js";
import { api } from "./api.js";

const AUTH_BASE = AUTH_API_BASE;

const AuthContext = createContext(null);

function decodeTokenPayload(token) {
  const payloadSegment = token?.split(".")?.[1];
  if (!payloadSegment) return null;

  const normalized = payloadSegment.replaceAll("-", "+").replaceAll("_", "/");
  const padding = normalized.length % 4;
  const padded = normalized + (padding ? "=".repeat(4 - padding) : "");
  return JSON.parse(atob(padded));
}

function normalizeUser(rawUser) {
  if (!rawUser) return null;
  const id = rawUser.id ?? rawUser.sub ?? rawUser.userId;
  const email = rawUser.email;
  const role = Array.isArray(rawUser.role)
    ? rawUser.role[0]
    : rawUser.role ?? rawUser.roles?.[0];

  if (!id || !email || !role) return null;
  return { id, email, role };
}

function parseToken(token) {
  try {
    const payload = decodeTokenPayload(token);
    if (!payload) return null;
    if (payload.exp * 1000 > Date.now()) {
      return normalizeUser(payload);
    }
    return null;
  } catch {
    return null;
  }
}

export function getPostLoginRoute(role) {
  return role === "Company" ? "/dashboard/company" : "/dashboard/talent";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const loggedIn = localStorage.getItem("inn_logged_in") === "true";
      if (loggedIn) {
        try {
          const res = await fetch(`${AUTH_BASE}/me`, {
            method: "GET",
            credentials: "include",
          });
          if (res.ok) {
            const body = await res.json();
            if (body?.success && body?.data?.user && !cancelled) {
              setUser(normalizeUser(body.data.user));
              setLoading(false);
              return;
            } else if (!body?.success && !cancelled) {
              // Try to refresh once
              try {
                const refreshRes = await fetch(`${AUTH_BASE}/refresh`, {
                  method: "POST",
                  credentials: "include",
                });
                if (refreshRes.ok) {
                  const refreshBody = await refreshRes.json();
                  if (refreshBody?.success) {
                    const meRes = await fetch(`${AUTH_BASE}/me`, {
                      method: "GET",
                      credentials: "include",
                    });
                    if (meRes.ok) {
                      const meBody = await meRes.json();
                      if (meBody?.success && meBody?.data?.user && !cancelled) {
                        setUser(normalizeUser(meBody.data.user));
                        setLoading(false);
                        return;
                      }
                    }
                  }
                }
              } catch (refreshErr) {
                console.error("[AuthContext] initAuth refresh failed:", refreshErr);
              }
            }
          }
        } catch (err) {
          console.error("[AuthContext] initAuth failed:", err);
        }
      }

      if (!cancelled) {
        _clearToken();
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const _storeToken = (userData) => {
    localStorage.setItem("inn_logged_in", "true");
    setUser(normalizeUser(userData));
  };

  const _clearToken = () => {
    clearStoredToken();
    localStorage.removeItem("inn_logged_in");
    setUser(null);
  };

  /** Step 1 of registration flow — creates auth account, returns nothing on success */
  const register = useCallback(async (email, password, role) => {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Registration failed.");
    return body.data;
  }, []);

  /** Verifies the OTP sent after registration */
  const verifyEmail = useCallback(async (email, otp) => {
    const res = await fetch(`${AUTH_BASE}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Verification failed.");
    return body.data;
  }, []);

  /** Re-sends an OTP of `type` to `email` */
  const resendOTP = useCallback(async (email, type) => {
    const res = await fetch(`${AUTH_BASE}/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Failed to resend OTP.");
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await fetch(`${AUTH_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Failed to send password reset OTP.");
    return body.message;
  }, []);

  const verifyResetOTP = useCallback(async (email, otp) => {
    const res = await fetch(`${AUTH_BASE}/verify-reset-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Failed to verify reset OTP.");
    return body.data;
  }, []);

  const resetPassword = useCallback(async (email, resetSessionId, newPassword) => {
    const res = await fetch(`${AUTH_BASE}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resetSessionId, newPassword }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Failed to reset password.");
    return body.message;
  }, []);

  /** Logs in and stores access token. Returns user object. */
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Login failed.");

    _storeToken(body.data.user);
    return body.data.user;
  }, []);

  /** Logs out of the current session */
  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    _clearToken();
  }, []);

  const requestDeleteProfile = useCallback(async () => {
    const res = await api.post("/auth/v1/request-delete-profile");
    const body = await res.json();
    return body;
  }, []);

  const verifyDeleteProfile = useCallback(async (otp) => {
    const res = await api.post("/auth/v1/delete-profile", { otp });
    const body = await res.json();
    _clearToken();
    return body;
  }, []);

  const accessToken = null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        verifyEmail,
        resendOTP,
        forgotPassword,
        verifyResetOTP,
        resetPassword,
        login,
        logout,
        requestDeleteProfile,
        verifyDeleteProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
