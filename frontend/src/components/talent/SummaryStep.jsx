import React from "react";

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

      <p className="text-xs text-slate-500 mt-3">
        By submitting, you confirm that your details are accurate and that your
        resume and links are up to date.
      </p>
    </div>
  );
};

export default SummaryStep;
