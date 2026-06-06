import { Link } from "react-router-dom";

const cardClass =
  "group relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 sm:p-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.12)]";

export default function RegisterChoice() {
  return (
    <div className="min-h-screen saas-section text-slate-900 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <div className="glass-panel overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="p-8 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/60 bg-white/55">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Create account
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 max-w-xl">
                Choose whether you are joining as a talent or a company.
              </h1>
              <p className="mt-4 text-sm text-slate-600 max-w-2xl">
                We use the role you select here to set up the right onboarding
                flow. Login stays simple with just your email and password.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-8">
                <Link to="/register/talent" className={cardClass}>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-emerald-700">
                    Talent
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    I am looking for internships
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Build your profile, upload your resume, and get matched to
                    roles.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                    Continue as Talent
                  </span>
                </Link>

                <Link to="/register/company" className={cardClass}>
                  <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-lime-700">
                    Company
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    I am hiring interns
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    Create your employer profile, post jobs, and manage
                    applicants.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-lime-700">
                    Continue as Company
                  </span>
                </Link>
              </div>
            </section>

            <aside className="p-8 sm:p-10 lg:p-12 bg-[linear-gradient(180deg,rgba(255,255,255,0.5)_0%,rgba(236,245,229,0.65)_100%)]">
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 border border-white/70">
                    Simple onboarding
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                    One login, one role, one clear path.
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 max-w-md">
                    After signup, the dashboard and navigation adapt to the role
                    you chose here.
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    Talent users get profile building, job matching, and saved
                    jobs.
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/70 p-4">
                    Company users get job posting, application tracking, and
                    hiring controls.
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-emerald-700">
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
