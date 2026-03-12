import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AUTH_BASE = "http://localhost:5001/auth/v1";

const AuthContext = createContext(null);

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 > Date.now()) {
      return { id: payload.sub, email: payload.email, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("inn_access_token");
    if (stored) {
      const parsed = parseToken(stored);
      if (parsed) {
        setAccessToken(stored);
        setUser(parsed);
      } else {
        localStorage.removeItem("inn_access_token");
      }
    }
    setLoading(false);
  }, []);

  const _storeToken = (token) => {
    localStorage.setItem("inn_access_token", token);
    setAccessToken(token);
    setUser(parseToken(token));
  };

  const _clearToken = () => {
    localStorage.removeItem("inn_access_token");
    setAccessToken(null);
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
      credentials: "include", // allow refresh-token cookie
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || "Login failed.");

    const { accessToken: token } = body.data;
    _storeToken(token);
    return body.data.user;
  }, []);

  /** Logs out of the current session */
  const logout = useCallback(async () => {
    const token = localStorage.getItem("inn_access_token");
    if (token) {
      try {
        await fetch(`${AUTH_BASE}/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
      } catch {
        // best-effort; always clear locally
      }
    }
    _clearToken();
  }, []);

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
