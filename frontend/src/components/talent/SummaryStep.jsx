import React from "react";
import { useFormContext } from "react-hook-form";

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm py-2.5 border-b border-white/5 last:border-0">
    <span className="text-slate-400 min-w-[130px]">{label}</span>
    <span className="text-slate-200 text-right flex-1 break-words">
      {Array.isArray(value) ? value.join(", ") : value || "—"}
    </span>
  </div>
);

const formatListSummary = (list) => {
  if (!list || list.length === 0) return "—";
  if (list.length === 1) return list[0];
  return `${list[0]} + ${list.length - 1} more`;
};

const SummaryStep = ({ values }) => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-5">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Review your information before submitting. You can go back to adjust any
        step.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Account & personal
          </p>
          <SummaryRow label="Email" value={values.email} />
          <SummaryRow label="Name" value={values.name} />
          <SummaryRow label="Location" value={values.location} />
          <SummaryRow label="Bio" value={values.bio} />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Education
          </p>
          <SummaryRow label="University" value={values.university} />
          <SummaryRow label="Degree level" value={values.degreeLevel} />
          <SummaryRow
            label="Major"
            value={
              values.majorOption === "OTHER"
                ? values.majorOther
                : values.majorOption
            }
          />
          <SummaryRow label="Graduation year" value={values.graduationYear} />
          <SummaryRow label="CGPA" value={values.cgpa} />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Skills & preferences
          </p>
          <SummaryRow label="Skills" value={formatListSummary(values.skills)} />
          <SummaryRow
            label="Preferred locations"
            value={formatListSummary(values.preferredLocations)}
          />
          <SummaryRow
            label="Preferred industries"
            value={formatListSummary(values.preferredIndustries)}
          />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Links
          </p>
          <SummaryRow label="LinkedIn" value={values.linkedinUrl} />
          <SummaryRow label="GitHub" value={values.githubUrl} />
          <SummaryRow label="Portfolio" value={values.portfolioUrl} />
        </div>
      </div>

      <div className="pt-4 border-t border-white/10 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative h-5 w-5 flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              id="acceptTerms"
              {...register("acceptTerms")}
              className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="absolute inset-0 rounded-md border border-white/20 bg-white/5 peer-hover:border-[#9fe870]/50 peer-checked:border-[#9fe870] peer-checked:bg-[#9fe870] transition-all duration-300" />
            <svg
              className="w-3.5 h-3.5 text-slate-950 opacity-0 peer-checked:opacity-100 transition-opacity duration-200 stroke-[3] z-20 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
            I accept the{" "}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9fe870] hover:underline hover:text-[#bdf594] font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9fe870] hover:underline hover:text-[#bdf594] font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-xs text-red-400 pl-8">{errors.acceptTerms.message}</p>
        )}
      </div>
    </div>
  );
};

export default SummaryStep;
