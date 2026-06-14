import { Link, useNavigate } from "react-router-dom";

const cardClass =
  "group relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-6 sm:p-8 transition-all hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(2,6,23,0.6)]";

export default function RegisterChoice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen saas-section text-slate-900 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="glass-panel relative overflow-visible">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute -top-6 -right-6 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white text-base shadow-lg shadow-black/30 transition-colors hover:bg-slate-900 hover:border-white/30"
            aria-label="Close"
          >
            ×
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/20 bg-white/6">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Create account
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100 max-w-xl">
                Choose whether you are joining as a talent or a company.
              </h1>
              <p className="mt-4 text-sm text-slate-400 max-w-2xl">
                We use the role you select here to set up the right onboarding
                flow. Login stays simple with just your email and password.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <Link to="/register/talent" className={cardClass}>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-emerald-300">
                    Talent
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-100">
                    I am looking for internships
                  </h2>
                  <p className="mt-3 text-sm text-slate-400">
                    Build your profile, upload your resume, and get matched to
                    roles.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                    Continue as Talent
                  </span>
                </Link>

                <Link to="/register/company" className={cardClass}>
                  <span className="inline-flex items-center rounded-full bg-lime-400/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-emerald-300">
                    Company
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-100">
                    I am hiring interns
                  </h2>
                  <p className="mt-3 text-sm text-slate-400">
                    Create your employer profile, post jobs, and manage
                    applicants.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
                    Continue as Company
                  </span>
                </Link>
              </div>
            </section>
            <aside className="p-8 sm:p-10 lg:p-12 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0.01)_100%)]">
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 border border-white/70">
                    Simple onboarding
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-100">
                    One login, one role, one clear path.
                  </h2>
                  <p className="mt-3 text-sm text-slate-400 max-w-md">
                    After signup, the dashboard and navigation adapt to the role
                    you chose here.
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-slate-300">
                    Talent users get profile building, job matching, and saved
                    jobs.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4 text-slate-300">
                    Company users get job posting, application tracking, and
                    hiring controls.
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-emerald-300">
                    Sign in
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
