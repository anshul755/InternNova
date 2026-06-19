import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmark, IoSparkles } from "react-icons/io5";
import { errorHandler } from "../lib/errorHandler.js";
import Seo from "../components/Seo.jsx";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ForgotPassword() {
  const { forgotPassword, verifyResetOTP, resetPassword, resendOTP } =
    useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetSessionId, setResetSessionId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordHint = useMemo(
    () =>
      "Use at least 8 characters with uppercase, lowercase, number, and special character.",
    [],
  );

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!/.+@.+\..+/.test(email)) {
      errorHandler.warning("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const message = await forgotPassword(email);
      errorHandler.success(message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Could not start password reset." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      errorHandler.warning("OTP must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyResetOTP(email, otp);
      setResetSessionId(data.resetSessionId);
      errorHandler.success("OTP verified. Set your new password.");
      setStep(3);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "OTP verification failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!passwordRule.test(newPassword)) {
      errorHandler.warning(passwordHint);
      return;
    }

    if (newPassword !== confirmPassword) {
      errorHandler.warning("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword(email, resetSessionId, newPassword);
      errorHandler.success(message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Could not reset password." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOTP(email, "PASSWORD_RESET");
      errorHandler.success("A new password reset OTP has been sent.");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Could not resend OTP." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 font-sans saas-section auth-flow dark:bg-transparent">
      <Seo title="InternNova | Reset Password" description="Reset your password to regain access to your InternNova account." path="/forgot-password" />
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] !text-lime-600">
              Recovery
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Reset your password
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Securely regain access to your InternNova account in a few simple steps.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Remembered your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-lime-500 underline decoration-lime-500/30 underline-offset-4 hover:text-lime-400 hover:decoration-lime-500/60"
            >
              Sign in
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
                    Secure account recovery.
                  </h2>
                  <p className="mt-4 text-base font-medium leading-relaxed">
                    We take the security of your account seriously. Use the OTP sent to your registered email to verify your identity and safely restore your access.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-[#7cc84a]/20 bg-gradient-to-br from-[#7cc84a]/10 via-emerald-500/5 to-transparent p-8 sm:p-10 shadow-lg">
                  <div className="absolute -mr-8 -mt-8 right-0 top-0 h-40 w-40 rounded-full bg-[#7cc84a]/20 blur-3xl" />
                  <div className="absolute -mb-8 -ml-8 bottom-0 left-0 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />

                  <div className="relative z-10">
                    <h3 className="mb-6 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                      <span className="bg-gradient-to-br from-[#7cc84a] to-emerald-600 bg-clip-text text-transparent dark:from-[#7cc84a] dark:to-emerald-400 drop-shadow-sm">
                        Verify.<br />Reset.<br />Return.
                      </span>
                    </h3>

                    <p className="text-base font-medium leading-relaxed">
                      Your data is protected by industry-leading security practices. Get back to connecting with the people and opportunities that matter.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="bg-slate-50 p-6 sm:p-8 lg:p-10 xl:p-12 dark:bg-transparent">
              <div className="mx-auto max-w-md">
                <div className="mb-8">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7cc84a]">
                    <IoSparkles className="h-4 w-4" />
                    Step {step} of 3
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-slate-50 sm:text-2xl">
                    {step === 1 ? "Enter your email" : step === 2 ? "Verify OTP" : "Choose new password"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {step === 1 ? "We'll send a 6-digit code to this address." : step === 2 ? "Check your inbox for the code we just sent." : "Make sure it's at least 8 characters long."}
                  </p>
                </div>

                <div className="mb-8 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className={`h-full bg-[#7cc84a] transition-all duration-500 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
                </div>

                {step === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label
                        htmlFor="resetEmail"
                        className="block text-xs font-bold tracking-wide text-slate-500"
                      >
                        EMAIL
                      </label>
                      <input
                        id="resetEmail"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition-all focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500 dark:focus:ring-lime-500/20"
                        placeholder="you@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset OTP"
                      )}
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label
                        htmlFor="otp"
                        className="block text-xs font-bold tracking-wide text-slate-500"
                      >
                        RESET OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition-all text-center tracking-[0.5em] font-mono focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500 dark:focus:ring-lime-500/20"
                        placeholder="------"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-xs font-semibold text-lime-500 hover:text-lime-400 disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-6" noValidate>
                    <div className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className="block text-xs font-bold tracking-wide text-slate-500"
                      >
                        NEW PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-base text-slate-900 outline-none transition-all focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500 dark:focus:ring-lime-500/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-slate-300"
                        >
                          {showNewPassword ? (
                            <IoEyeOffOutline className="h-5 w-5" />
                          ) : (
                            <IoEyeOutline className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-xs font-bold tracking-wide text-slate-500"
                      >
                        CONFIRM PASSWORD
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-base text-slate-900 outline-none transition-all focus:border-lime-500 focus:ring-4 focus:ring-lime-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-lime-500 dark:focus:ring-lime-500/20"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-slate-300"
                        >
                          {showConfirmPassword ? (
                            <IoEyeOffOutline className="h-5 w-5" />
                          ) : (
                            <IoEyeOutline className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
