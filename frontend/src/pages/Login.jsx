import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getPostLoginRoute, useAuth } from "../lib/AuthContext.jsx";
import {
  IoCheckmarkCircle,
  IoEyeOffOutline,
  IoEyeOutline,
  IoShieldCheckmark,
  IoSparkles,
  IoStar,
  IoAlertCircleOutline,
} from "react-icons/io5";
import { errorHandler } from "../lib/errorHandler.js";
import Seo from "../components/Seo.jsx";

const Login = () => {
  const { login, resendOTP, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const customMessage = location.state?.customMessage;

  useEffect(() => {
    if (!loading && user) {
      navigate(getPostLoginRoute(user.role), { replace: true });
    }
  }, [loading, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
    setErrorType("");
    setResendMessage("");
  };

  const validateEmail = (email) => /.+@.+\..+/.test(email);

  const handleResendVerification = async () => {
    setResendingOtp(true);
    setResendMessage("");
    try {
      await resendOTP(formValues.email, "EMAIL_VERIFICATION");
      errorHandler.success("Verification OTP sent. Please check your inbox.");
      setResendMessage("Verification OTP sent. Please check your inbox.");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to resend OTP. Please try again." });
      setResendMessage(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formValues;

    if (!validateEmail(email) || password.trim().length < 6) {
      const errorMsg = "Please enter a valid email and password with at least 6 characters.";
      errorHandler.warning(errorMsg, { title: "Invalid Input" });
      setError(errorMsg);
      setErrorType("general");
      return;
    }

    setSubmitting(true);
    setError("");
    setErrorType("");
    setResendMessage("");
    try {
      const loggedInUser = await login(email, password);
      errorHandler.success("Logged in successfully!", { title: "Welcome" });
      navigate(getPostLoginRoute(loggedInUser?.role), { replace: true });
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Login failed." });
      const msg = err.message || "Login failed.";
      const lowerMsg = msg.toLowerCase();

      setError(msg);
      if (lowerMsg.includes("verify") || lowerMsg.includes("verified")) {
        setErrorType("unverified");
      } else if (lowerMsg.includes("lock") || lowerMsg.includes("try again")) {
        setErrorType("locked");
      } else {
        setErrorType("general");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 font-sans saas-section auth-flow dark:bg-transparent">
      <Seo title="InternNova | Login" description="Sign in to your InternNova account to manage your profile or post internships." path="/login" />
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] !text-lime-600">
              Sign in
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Welcome back to InternNova
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Continue to your talent or company dashboard with one secure login.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            New here?{" "}
            <Link
              to="/register"
              className="font-semibold text-lime-500 underline decoration-lime-500/30 underline-offset-4 hover:text-lime-400 hover:decoration-lime-500/60"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[var(--app-glass-strong)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.36)]">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.7fr)]">
            <aside className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12 dark:border-white/10">
              <div className="flex h-full flex-col justify-between gap-10">
                <div className="pl-8 sm:pl-10">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-500/20 bg-lime-500/10 text-lime-500 -ml-8">
                    <IoShieldCheckmark className="h-6 w-6" />
                  </div>
                  <h2 className="mt-6 max-w-2xl text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">
                    Join the premier talent network.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm text-base font-medium leading-relaxed text sm:text-base">
                    Access world-class opportunities and top-tier candidates. Experience a streamlined hiring workflow designed for modern teams and ambitious professionals.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-[#7cc84a]/20 bg-gradient-to-br from-[#7cc84a]/10 via-emerald-500/5 to-transparent p-8 sm:p-10 shadow-lg">
                  <div className="absolute -mr-8 -mt-8 right-0 top-0 h-40 w-40 rounded-full bg-[#7cc84a]/20 blur-3xl" />
                  <div className="absolute -mb-8 -ml-8 bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

                  <div className="relative z-10">
                    <h3 className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                      <span className="bg-gradient-to-br from-[#7cc84a] to-emerald-600 bg-clip-text text-transparent dark:from-[#7cc84a] dark:to-emerald-400 drop-shadow-sm">
                        Discover.<br />Connect.<br />Build.
                      </span>
                    </h3>

                    <p className="text-base font-medium leading-relaxed text">
                      We are building the infrastructure for tomorrow's workforce. Skip the noise and connect directly with the people and opportunities that actually matter.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex items-center bg-slate-50/70 p-6 sm:p-8 lg:p-10 xl:p-12 dark:bg-white/[0.025]">
              <div className="w-full">
                <div className="mb-7">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] !text-[#7cc84a]">
                    <IoSparkles className="h-4 w-4" />
                    Account access
                  </p>
                  <h2 className="mt-3 text-xl font-bold text-slate-50 sm:text-2xl">
                    Sign in to continue
                  </h2>
                  {customMessage ? (
                    <p className="mt-3 rounded-2xl border border-lime-500/20 bg-lime-500/10 px-4 py-3 text-sm text-lime-400">
                      {customMessage}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Use your registered email and password. We will send you
                      to the correct dashboard automatically.
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 text-sm"
                  aria-live="polite"
                  noValidate
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formValues.email}
                        onChange={handleChange}
                        className={`input-glass py-3.5 text-sm sm:text-base ${error ? "border-rose-400" : ""
                          }`}
                        aria-required="true"
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? "login-error" : undefined}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
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
                        className={`input-glass py-3.5 pr-14 text-sm sm:text-base ${error ? "border-rose-400" : ""
                          }`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <IoEyeOffOutline className="h-5 w-5" />
                        ) : (
                          <IoEyeOutline className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <Link
                        to="/forgot-password"
                        className="text-xs font-semibold text-lime-500 hover:text-lime-400"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {errorType === "unverified" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-250 bg-amber-50/60 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      <IoAlertCircleOutline className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-950 dark:text-amber-100">Your email is not verified yet.</p>
                        <p className="mt-1 leading-relaxed opacity-90">Please verify your email address to log in.</p>
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={resendingOtp}
                          className="mt-2 inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 hover:underline dark:text-lime-400 dark:hover:text-lime-300 disabled:opacity-50 disabled:no-underline cursor-pointer"
                        >
                          {resendingOtp ? (
                            <>
                              <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Resend verification email →"
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {errorType === "locked" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border border-rose-200 bg-rose-50/60 text-xs text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                      <IoAlertCircleOutline className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-rose-950 dark:text-rose-100">Account Temporarily Locked</p>
                        <p className="mt-1 leading-relaxed opacity-90">Too many failed attempts. Please wait a few minutes or reset your password.</p>
                      </div>
                    </div>
                  )}

                  {resendMessage && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-xs text-emerald-850 dark:border-lime-500/20 dark:bg-lime-500/10 dark:text-lime-400">
                      <IoCheckmarkCircle className="h-5 w-5 text-emerald-600 dark:text-lime-400 shrink-0 mt-0.5" />
                      <p className="flex-1 leading-relaxed">{resendMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
