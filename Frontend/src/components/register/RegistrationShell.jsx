import React from "react";
import { Link } from "react-router-dom";
import { IoCheckmark, IoClose } from "react-icons/io5";

const RegistrationShell = ({
  eyebrow,
  title,
  subtitle,
  steps,
  activeStep,
  getStepStatus,
  descriptions,
  loginText = "Already have an account?",
  children,
}) => {
  const activeDescription = descriptions[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 text-slate-900 sm:px-6 lg:px-8 font-sans saas-section auth-flow">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              {subtitle}
            </p>
          </div>
          <p className="text-sm text-slate-400">
            {loginText}{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-300 underline decoration-emerald-400/30 underline-offset-4 hover:text-emerald-200 hover:decoration-emerald-400/60"
            >
              Log in
            </Link>
          </p>
        </div>

        <div className="glass-panel overflow-hidden rounded-[28px]">
          <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-white/[0.025] p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
              <div className="lg:hidden">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      Step {activeStep + 1} of {steps.length}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-50">
                      {activeDescription.title}
                    </h2>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-300">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="hidden lg:block">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Step {activeStep + 1} of {steps.length}
                </p>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-50">
                  {activeDescription.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {activeDescription.desc}
                </p>

                <ol className="mt-8 space-y-2">
                  {steps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isActive = status === "active";
                    const isDone = status === "done";
                    const isError = status === "error";

                    return (
                      <li key={step.id}>
                        <div
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${
                            isActive
                              ? "border-emerald-400/25 bg-emerald-400/10"
                              : isDone
                                ? "border-white/10 bg-white/[0.035]"
                                : isError
                                  ? "border-rose-400/25 bg-rose-500/10"
                                  : "border-transparent"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              isActive
                                ? "bg-emerald-400 text-slate-950"
                                : isDone
                                  ? "bg-emerald-400/15 text-emerald-300"
                                  : isError
                                    ? "bg-rose-500/20 text-rose-300"
                                    : "bg-white/[0.06] text-slate-500"
                            }`}
                          >
                            {isDone ? (
                              <IoCheckmark className="h-4 w-4" />
                            ) : isError ? (
                              <IoClose className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              isActive
                                ? "text-emerald-200"
                                : isDone
                                  ? "text-slate-300"
                                  : isError
                                    ? "text-rose-300"
                                    : "text-slate-500"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </aside>

            <main className="min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationShell;
