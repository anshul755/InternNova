import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getPostLoginRoute, useAuth } from "../lib/AuthContext.jsx";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const Login = ({ modal = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const customMessage = location.state?.customMessage;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateEmail = (email) => {
    return /.+@.+\..+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formValues;

    if (!validateEmail(email) || password.trim().length < 6) {
      setError("Please enter a valid email and password (min 6 characters).");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const loggedInUser = await login(email, password);
      navigate(getPostLoginRoute(loggedInUser?.role), { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const containerClasses = modal
    ? "w-full text-slate-900 flex items-center justify-center px-[2vw] py-4 font-sans"
    : "min-h-screen text-slate-900 flex items-center justify-center px-[5vw] py-8 font-sans saas-section";

  const panelClass = modal
    ? "relative w-full max-w-sm rounded-3xl auth-panel overflow-visible"
    : "relative w-full max-w-sm rounded-3xl auth-panel overflow-visible";

  return (
    <div className={containerClasses}>
      <div className={panelClass}>
        {!modal && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute -top-6 -right-6 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white text-base shadow-lg shadow-black/30 transition-colors hover:bg-slate-900 hover:border-white/30"
            aria-label="Close"
          >
            ×
          </button>
        )}
        <section className="flex flex-col justify-center px-6 py-6 sm:px-8 auth-panel__content max-w-sm mx-auto w-full">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Sign in
            </p>
            <h2 className="mt-2 text-lg sm:text-xl font-semibold text-slate-900">
              Welcome back to InternNova
            </h2>
            {customMessage ? (
              <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg px-3 py-2">
                {customMessage}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-500">
                Use your email and password. We will route you to the right
                dashboard automatically.
              </p>
            )}
          </header>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 text-sm"
            aria-live="polite"
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-600"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className={`input-glass ${error ? "border-rose-400" : ""}`}
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "login-error" : undefined}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-600"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formValues.password}
                    onChange={handleChange}
                    className={`input-glass pr-12 ${error ? "border-rose-400" : ""}`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="w-5 h-5" />
                    ) : (
                      <IoEyeOutline className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/60 bg-white/20"
                      onChange={(e) => {
                        /* remember me handled locally only for UI; auth context can persist if needed */
                      }}
                      aria-label="Remember me"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs text-slate-600"
                    >
                      Remember me
                    </label>
                  </div>
                  <div>
                    <Link
                      to="/forgot-password"
                      className="text-[0.72rem] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>

              {error && (
                <p
                  id="login-error"
                  role="alert"
                  className="text-xs text-rose-600 bg-rose-100 border border-rose-200 rounded-md px-3 py-2 dark:bg-rose-950/35 dark:border-rose-900/40 dark:text-rose-200"
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                  Signing in...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
          <div className="mt-5 flex flex-col gap-1.5 text-[0.78rem] text-slate-500">
            <p>
              New here?{" "}
              <Link
                to="/register"
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Create an account
              </Link>
            </p>

            <p className="text-[0.7rem] text-slate-500 mt-1">
              By continuing, you agree to InternNova&apos;s terms of use and
              acknowledge our privacy policy.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
