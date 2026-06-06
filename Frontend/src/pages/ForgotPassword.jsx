import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

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
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordHint = useMemo(
    () =>
      "Use at least 8 characters with uppercase, lowercase, number, and special character.",
    [],
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
    <div className="min-h-screen text-slate-900 flex items-center justify-center px-4 py-8 font-sans saas-section auth-flow">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/60 p-8 shadow-2xl">
        <header className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Password Reset
          </p>
          <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900">
            Reset your password
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Request an OTP, verify it, then choose a new password.
          </p>
        </header>

        <div className="mb-5 flex items-center gap-2 text-[0.7rem] text-slate-500">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={`flex-1 rounded-full px-3 py-2 text-center border ${
                step >= item
                  ? "bg-emerald-500/15 border-emerald-400 text-emerald-700"
                  : "bg-white/70 border-white/60 text-slate-500"
              }`}
            >
              Step {item}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="resetEmail"
                className="block text-xs font-medium text-slate-600"
              >
                Email
              </label>
              <input
                id="resetEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass text-sm"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="otp"
                className="block text-xs font-medium text-slate-600"
              >
                Reset OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="input-glass text-sm"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
            >
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="block text-xs font-medium text-slate-600"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-glass pr-12 text-sm"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-slate-700"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <IoEyeOffOutline className="w-5 h-5" />
                  ) : (
                    <IoEyeOutline className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-600"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-glass pr-12 text-sm"
                  placeholder="Re-enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-slate-700"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <IoEyeOffOutline className="w-5 h-5" />
                  ) : (
                    <IoEyeOutline className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[0.7rem] text-slate-500">{passwordHint}</p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-xs text-rose-600 bg-rose-100 border border-rose-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
