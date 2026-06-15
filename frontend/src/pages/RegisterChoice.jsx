import { Link } from "react-router-dom";

const cardClass =
  "group relative flex min-h-[250px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-lime-500 hover:shadow-[0_22px_50px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-white/[0.04] sm:p-7";

export default function RegisterChoice() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 font-sans saas-section auth-flow dark:bg-transparent">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-lime-600">
              Create account
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Choose your InternNova role
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Pick the path that fits you. We will set up the right onboarding
              flow and dashboard for your account.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-lime-500 underline decoration-lime-500/30 underline-offset-4 hover:text-lime-400 hover:decoration-lime-500/60"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[var(--app-glass-strong)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.36)]">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.7fr)]">
            <section className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12 dark:border-white/10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-500">
                Select role
              </p>
              <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight text-slate-50 sm:text-3xl lg:text-[2.15rem]">
                Are you joining as talent or as a company?
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                This choice controls your onboarding questions and the dashboard
                you see after signup.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Link to="/register/talent" className={cardClass}>
                  <span className="inline-flex w-fit items-center rounded-full border border-lime-500 bg-lime-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime-600 dark:border-lime-600/20 dark:bg-lime-600/15 dark:text-lime-500">
                    Talent
                  </span>
                  <h3 className="mt-6 min-h-[58px] text-xl font-bold leading-tight text-slate-50 sm:text-2xl">
                    I am looking for internships
                  </h3>
                  <p className="mt-4 min-h-[66px] text-sm leading-6 text-slate-400">
                    Build your profile, upload your resume, and get matched to
                    relevant roles.
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime-600 group-hover:gap-3 dark:text-lime-500">
                    Continue as Talent
                    <span aria-hidden="true">-&gt;</span>
                  </span>
                </Link>

                <Link to="/register/company" className={cardClass}>
                  <span className="inline-flex w-fit items-center rounded-full border border-lime-500 bg-lime-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime-600 dark:border-lime-600/20 dark:bg-lime-600/15 dark:text-lime-500">
                    Company
                  </span>
                  <h3 className="mt-6 min-h-[58px] text-xl font-bold leading-tight text-slate-50 sm:text-2xl">
                    I am hiring interns
                  </h3>
                  <p className="mt-4 min-h-[66px] text-sm leading-6 text-slate-400">
                    Create your employer profile, post internships, and manage
                    applicants.
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-lime-600 group-hover:gap-3 dark:text-lime-500">
                    Continue as Company
                    <span aria-hidden="true">-&gt;</span>
                  </span>
                </Link>
              </div>
            </section>

            <aside className="border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:p-10 xl:p-12 dark:bg-white/[0.025]">
              <div className="grid gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-500">
                    Tailored Experience
                  </p>
                  <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">
                    Designed for your success.
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-6 text-slate-400 sm:text-base">
                    InternNova intelligently adapts to your objectives,
                    delivering a focused suite of tools the moment you log in.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <h3 className="mb-2 text-sm font-semibold text-slate-50">Talent Network</h3>
                    <p className="text-sm leading-6 text-slate-300">
                      Gain access to exclusive opportunities, showcase your skills with a dynamic profile, and track your applications effortlessly.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <h3 className="mb-2 text-sm font-semibold text-slate-50">Employer Portal</h3>
                    <p className="text-sm leading-6 text-slate-300">
                      Discover top-tier candidates, publish openings seamlessly, and manage your entire hiring pipeline from a centralized dashboard.
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-6 text-slate-400">
                  Select your path to continue. Your workspace will be custom-configured based on your role immediately upon registration.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
