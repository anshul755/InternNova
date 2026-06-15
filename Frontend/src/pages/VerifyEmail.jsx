import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import FormErrorBanner from "../components/FormErrorBanner.jsx";

const OTP_LENGTH = 6;

export default function VerifyEmail() {
  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email ?? "";
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState(emailFromState);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRefs = useRef([]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    setError("");

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtp(updated);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await verifyEmail(email, code);
      setSuccess("Email verified! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setResending(true);
    setError("");
    try {
      await resendOTP(email, "EMAIL_VERIFICATION");
      setSuccess("A new OTP has been sent to your inbox.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 flex items-center justify-center px-4 font-sans saas-section auth-flow">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-white/60 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-400 text-emerald-700 text-xl">
            ✉
          </div>
          <h1 className="text-xl font-semibold text-slate-900">
            Check your inbox
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            We sent a 6-digit OTP to{" "}
            {emailFromState ? (
              <span className="text-slate-900 font-medium">
                {emailFromState}
              </span>
            ) : (
              "your email"
            )}
            . It expires in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5" noValidate>
          {!emailFromState && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass text-sm"
                placeholder="you@example.com"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Enter OTP
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`h-12 w-10 rounded-lg text-center text-lg font-semibold input-glass ${
                    error
                      ? "border-rose-400"
                      : digit
                        ? "border-emerald-400 text-slate-900"
                        : "border-white/70 text-slate-700"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          <FormErrorBanner
            message={error}
            onDismiss={() => setError("")}
          />

          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length < OTP_LENGTH}
            className="btn-primary w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
        <div className="mt-5 text-center text-xs text-slate-500">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <div className="mt-3 text-center">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {"← Back to login"}
          </Link>
        </div>
      </div>
    </div>
  );
}
