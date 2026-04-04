import { useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-slate-950/70 border border-slate-800 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xl">
            ✉
          </div>
          <h1 className="text-xl font-semibold text-slate-50">Check your inbox</h1>
          <p className="mt-1.5 text-xs text-slate-400">
            We sent a 6-digit OTP to{" "}
            {emailFromState ? (
              <span className="text-slate-200 font-medium">{emailFromState}</span>
            ) : (
              "your email"
            )}
            . It expires in 10 minutes.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          {!emailFromState && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400 transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
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
                  className={`h-12 w-10 rounded-lg text-center text-lg font-semibold bg-slate-900 border outline-none transition-colors ${
                    error
                      ? "border-rose-500/80 focus:border-rose-400"
                      : digit
                      ? "border-sky-400 text-sky-200"
                      : "border-slate-700 focus:border-sky-400 text-slate-100"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-700 rounded-md px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.join("").length < OTP_LENGTH}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>
        <div className="mt-5 text-center text-xs text-slate-400">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-sky-400 hover:text-sky-300 font-medium disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        </div>

        <div className="mt-3 text-center">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
