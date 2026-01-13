import React, { useState } from "react";
import { Link } from "react-router-dom";

const CompanyRegister = () => {
  const [formValues, setFormValues] = useState({
    companyName: "",
    companyEmail: "",
    password: "",
    confirmPassword: "",
    website: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const passwordPolicy =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%_])[A-Za-z\d@#$%_]{8,}$/;

    if (!passwordPolicy.test(formValues.password)) {
      setError(
        "Password must be 8+ characters and include uppercase, lowercase, a digit, and one special character from @#$%_."
      );
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // Registration submission placeholder – no backend logic.
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white flex items-center justify-center px-[5vw] py-8 font-sans">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-950/70 border border-slate-800 shadow-[0_22px_60px_rgba(15,23,42,0.9)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr]">
        <aside className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#38bdf8_0,_transparent_55%)] p-8 text-sm text-slate-50">
          <div>
            <h2 className="text-lg font-semibold">Designed for lean teams</h2>
            <p className="mt-2 text-slate-100/85">
              Post internships, review applicants, and coordinate interviews
              without adding another complex HR tool.
            </p>
          </div>
          <ul className="space-y-2 mt-4 text-slate-100/85 list-disc list-inside text-xs">
            <li>Structured candidate profiles for quick screening.</li>
            <li>Collaborate with hiring managers on shortlists.</li>
            <li>Promote your brand to emerging talent early.</li>
          </ul>
        </aside>

        <section className="px-6 py-8 sm:px-10">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Register company
            </p>
            <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">
              Hire interns with InternNova
            </h1>
            <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
              Create a company profile so you can publish internships and manage
              applicant pipelines.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <label
                htmlFor="companyName"
                className="block text-xs font-medium text-slate-300"
              >
                Company name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formValues.companyName}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-emerald-400"
                placeholder="InternNova Labs Pvt. Ltd."
                required
              />
            </div>

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
                value={formValues.companyEmail}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-emerald-400"
                placeholder="talent@yourcompany.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="website"
                className="block text-xs font-medium text-slate-300"
              >
                Company website (optional)
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formValues.website}
                onChange={handleChange}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-emerald-400"
                placeholder="https://yourcompany.com"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-300"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formValues.password}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-emerald-400"
                  placeholder="8+ chars, Aa1@#$%_"
                  required
                />
                <ul className="text-[0.7rem] text-slate-500 list-disc list-inside space-y-1 mt-1">
                  <li>
                    Password must be at least 8 characters long (12+
                    recommended).
                  </li>
                  <li>
                    Include at least one uppercase letter, one lowercase letter
                    one digit, and one special character from @#$%_.
                  </li>
                  <li>
                    Avoid company name or simple sequences like "1234" or
                    "abcd".
                  </li>
                </ul>
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
                  name="confirmPassword"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-emerald-400"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 text-slate-950 font-medium text-sm py-2.5 hover:bg-emerald-300 transition-transform hover:-translate-y-[1px] shadow-[0_10px_30px_rgba(52,211,153,0.45)]"
            >
              Create company profile
            </button>
          </form>

          <p className="mt-5 text-[0.8rem] text-slate-400">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Log in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default CompanyRegister;
