import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPostLoginRoute, useAuth } from "../lib/AuthContext.jsx";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const Login = ({ modal = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    ? "w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl auth-panel overflow-hidden"
    : "w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl auth-panel overflow-hidden";

  return (
    <div className={containerClasses}>
      <div className={panelClass}>
        <section className="hidden lg:flex flex-col justify-between auth-panel__aside border-r p-10 text-slate-900">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs tracking-[0.16em] uppercase text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Internship-ready in weeks
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
              InternNova
            </h1>
            <p className="mt-3 text-sm text-slate-600 max-w-sm">
              One platform, two journeys. Students discover meaningful
              internships while companies find motivated early talent, faster.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/70 flex items-center justify-center text-xs font-semibold border border-white/70">
                U
              </div>
              <p>
                <span className="font-medium">Students</span> get tailored
                matches and a focused dashboard for applications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-white/70 flex items-center justify-center text-xs font-semibold border border-white/70">
                C
              </div>
              <p>
                <span className="font-medium">Companies</span> manage intern
                pipelines and evaluate candidates in one place.
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col justify-center px-6 py-8 sm:px-10 auth-panel__content">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Sign in
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">
              Welcome back to InternNova
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              Use your email and password. We will route you to the right
              dashboard automatically.
            </p>
          </header>
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
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
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-600"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[0.7rem] text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    Forgot password?
                  </Link>
                </div>
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
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-100 border border-rose-200 rounded-md px-3 py-2 dark:bg-rose-950/35 dark:border-rose-900/40 dark:text-rose-200">
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
