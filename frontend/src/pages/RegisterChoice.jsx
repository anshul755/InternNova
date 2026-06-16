import { Link } from "react-router-dom";
import {
  IoPersonOutline,
  IoBusinessOutline,
  IoArrowForward,
  IoSparkles,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

export default function RegisterChoice() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/80 px-4 py-8 text-slate-900 sm:px-6 lg:px-8 font-sans saas-section auth-flow dark:bg-transparent">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-lime-600 dark:text-lime-400">
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

        {/* Main Panel Box */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[var(--app-glass-strong)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.36)]">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.7fr)]">
            
            {/* Left Side: Role Selection Cards */}
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

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {/* Talent Card */}
                <Link
                  to="/register/talent"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-lime-500 hover:shadow-[0_22px_50px_rgba(124,200,74,0.15)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-lime-500/50 sm:p-8"
                >
                  <div>
                    {/* Icon Container */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400 transition-transform duration-300 group-hover:scale-110">
                      <IoPersonOutline className="h-6 w-6" />
                    </div>

                    <h3 className="mt-6 text-2xl font-bold leading-tight text-slate-50">
                      I am looking for internships
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      Build your profile, upload your resume, and get matched to
                      relevant roles.
                    </p>
                  </div>

                  {/* Continue Button styled as btn-primary */}
                  <span className="btn-primary mt-8 w-full justify-center py-3 text-sm !text-black transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-hover:brightness-106">
                    Continue as Talent
                    <IoArrowForward className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>

                {/* Company Card */}
                <Link
                  to="/register/company"
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-lime-500 hover:shadow-[0_22px_50px_rgba(124,200,74,0.15)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-lime-500/50 sm:p-8"
                >
                  <div>
                    {/* Icon Container */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:border-lime-400/20 dark:bg-lime-400/10 dark:text-lime-400 transition-transform duration-300 group-hover:scale-110">
                      <IoBusinessOutline className="h-6 w-6" />
                    </div>

                    <h3 className="mt-6 text-2xl font-bold leading-tight text-slate-50">
                      I am hiring interns
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                      Create your employer profile, post internships, and manage
                      applicants.
                    </p>
                  </div>

                  {/* Continue Button styled as btn-secondary */}
                  <span className="btn-secondary mt-8 w-full justify-center py-3 text-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5 group-hover:brightness-106">
                    Continue as Company
                    <IoArrowForward className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </section>

            {/* Right Side: Tailored Experience Aside */}
            <aside className="border-slate-200 bg-slate-50/70 p-6 sm:p-8 lg:p-10 xl:p-12 dark:bg-white/[0.025] flex flex-col justify-between">
              <div className="grid gap-6">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-500">
                    <IoSparkles className="h-4 w-4 animate-pulse" />
                    Tailored Experience
                  </p>
                  <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-50 sm:text-3xl">
                    Designed for your success.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    InternNova intelligently adapts to your objectives,
                    delivering a focused suite of tools the moment you log in.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Feature 1 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex gap-3">
                      <IoCheckmarkCircleOutline className="h-5 w-5 text-lime-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-slate-50">Talent Network</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">
                          Gain access to exclusive opportunities, showcase your skills with a dynamic profile, and track your applications effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2 */}
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex gap-3">
                      <IoCheckmarkCircleOutline className="h-5 w-5 text-lime-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-slate-50">Employer Portal</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-300">
                          Discover top-tier candidates, publish openings seamlessly, and manage your entire hiring pipeline from a centralized dashboard.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-xs leading-relaxed text-slate-400">
                Select your path to continue. Your workspace will be custom-configured based on your role immediately upon registration.
              </p>
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}
