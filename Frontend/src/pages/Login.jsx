import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

const Login = ({ modal = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("user");
  const [formValues, setFormValues] = useState({
    userEmail: "",
    userPassword: "",
    companyEmail: "",
    companyPassword: "",
  });
  const [errors, setErrors] = useState({ user: "", company: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, user: "", company: "" }));
  };

  const validateEmail = (email) => {
    return /.+@.+\..+/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email =
      activeTab === "user" ? formValues.userEmail : formValues.companyEmail;
    const password =
      activeTab === "user" ? formValues.userPassword : formValues.companyPassword;
    const errorKey = activeTab === "user" ? "user" : "company";

    if (!validateEmail(email) || password.trim().length < 6) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: "Please enter a valid email and password (min 6 characters).",
      }));
      return;
    }

    setSubmitting(true);
    setErrors({ user: "", company: "" });
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, [errorKey]: err.message || "Login failed." }));
    } finally {
      setSubmitting(false);
    }
  };

  const isUserActive = activeTab === "user";

  const containerClasses = modal
    ? "w-full text-white flex items-center justify-center px-[2vw] py-4 font-sans"
    : "min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white flex items-center justify-center px-[5vw] py-8 font-sans";

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl bg-slate-950/70 border border-transparent overflow-hidden">
        <section className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#a855f7_0,_transparent_55%)] p-10 text-slate-50">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700 text-xs tracking-[0.16em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Internship-ready in weeks
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              InternNova
            </h1>
            <p className="mt-3 text-sm text-slate-200/80 max-w-sm">
              One platform, two journeys. Students discover meaningful
              internships while companies find motivated early talent, faster.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-100/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-slate-900/70 flex items-center justify-center text-xs font-semibold border border-slate-700">
                U
              </div>
              <p>
                <span className="font-medium">Students</span> get tailored
                matches and a focused dashboard for applications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-slate-900/70 flex items-center justify-center text-xs font-semibold border border-slate-700">
                C
              </div>
              <p>
                <span className="font-medium">Companies</span> manage intern
                pipelines and evaluate candidates in one place.
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col justify-center px-6 py-8 sm:px-10 bg-slate-950/40">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Sign in
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">
              Welcome back to InternNova
            </h2>
            <p className="mt-1.5 text-xs text-slate-400">
              Choose how you want to log in: as a student or as a company.
            </p>
          </header>
          <div className="flex rounded-full bg-slate-900/70 p-1 text-xs mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("user")}
              className={`flex-1 px-4 py-2 rounded-full transition-colors ${
                isUserActive
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("company")}
              className={`flex-1 px-4 py-2 rounded-full transition-colors ${
                !isUserActive
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Company
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {isUserActive ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="userEmail"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Email
                  </label>
                  <input
                    id="userEmail"
                    name="userEmail"
                    type="email"
                    autoComplete="email"
                    value={formValues.userEmail}
                    onChange={handleChange}
                    className={`w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
                      errors.user
                        ? "border-rose-500/80 focus:border-rose-400"
                        : "border-slate-700 focus:border-sky-400"
                    }`}
                    placeholder="you@studentmail.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="userPassword"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[0.7rem] text-sky-400 hover:text-sky-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="userPassword"
                    name="userPassword"
                    type="password"
                    autoComplete="current-password"
                    value={formValues.userPassword}
                    onChange={handleChange}
                    className={`w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
                      errors.user
                        ? "border-rose-500/80 focus:border-rose-400"
                        : "border-slate-700 focus:border-sky-400"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {errors.user && (
                  <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
                    {errors.user}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="companyEmail"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Company email
                  </label>
                  <input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    autoComplete="email"
                    value={formValues.companyEmail}
                    onChange={handleChange}
                    className={`w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
                      errors.company
                        ? "border-rose-500/80 focus:border-rose-400"
                        : "border-slate-700 focus:border-emerald-400"
                    }`}
                    placeholder="talent@yourcompany.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="companyPassword"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[0.7rem] text-emerald-400 hover:text-emerald-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="companyPassword"
                    name="companyPassword"
                    type="password"
                    autoComplete="current-password"
                    value={formValues.companyPassword}
                    onChange={handleChange}
                    className={`w-full rounded-lg bg-slate-900 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
                      errors.company
                        ? "border-rose-500/80 focus:border-rose-400"
                        : "border-slate-700 focus:border-emerald-400"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {errors.company && (
                  <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
                    {errors.company}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-sky-300 disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:-translate-y-[1px] shadow-[0_10px_30px_rgba(56,189,248,0.45)]"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                  Signing in…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>
          <div className="mt-5 flex flex-col gap-1.5 text-[0.78rem] text-slate-400">
            {isUserActive ? (
              <p>
                New here?{" "}
                <Link
                  to="/register/user"
                  className="text-sky-400 hover:text-sky-300 font-medium"
                >
                  Create an account
                </Link>
              </p>
            ) : (
              <p>
                Hiring interns?{" "}
                <Link
                  to="/register/company"
                  className="text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Register company
                </Link>
              </p>
            )}

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
