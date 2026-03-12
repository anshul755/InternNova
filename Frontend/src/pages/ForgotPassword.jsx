import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ForgotPassword() {
  const { forgotPassword, verifyResetOTP, resetPassword, resendOTP } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetSessionId, setResetSessionId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const passwordHint = useMemo(
    () => "Use at least 8 characters with uppercase, lowercase, number, and special character.",
    []
  );

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/.+@.+\..+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const message = await forgotPassword(email);
      setSuccess(message);
      setStep(2);
    } catch (err) {
      setError(err.message || "Could not start password reset.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyResetOTP(email, otp);
      setResetSessionId(data.resetSessionId);
      setSuccess("OTP verified. Set your new password.");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!passwordRule.test(newPassword)) {
      setError(passwordHint);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword(email, resetSessionId, newPassword);
      setSuccess(message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await resendOTP(email, "PASSWORD_RESET");
      setSuccess("A new password reset OTP has been sent.");
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/70 border border-slate-800 p-8 shadow-2xl">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Password Reset</p>
          <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">
            Reset your password
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Request an OTP, verify it, then choose a new password.
          </p>
        </header>

        <div className="mb-5 flex items-center gap-2 text-[0.7rem] text-slate-300">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`flex-1 rounded-full px-3 py-2 text-center border ${
                step >= item
                  ? "bg-sky-500/20 border-sky-400 text-sky-100"
                  : "bg-slate-900/60 border-slate-700 text-slate-400"
              }`}
            >
              Step {item}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="resetEmail" className="block text-xs font-medium text-slate-300">
                Email
              </label>
              <input
                id="resetEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="otp" className="block text-xs font-medium text-slate-300">
                Reset OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-xs text-sky-400 hover:text-sky-300 disabled:opacity-60"
            >
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="block text-xs font-medium text-slate-300">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-300"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <p className="text-[0.7rem] text-slate-400">{passwordHint}</p>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-700 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        <div className="mt-5 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}