import React from "react";

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-xs py-1.5 border-b border-slate-800/60 last:border-0">
    <span className="text-slate-400 min-w-[120px]">{label}</span>
    <span className="text-slate-100 text-right flex-1 break-words">
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
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 6 · Review and submit
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Review your information before submitting. You can go back to adjust any
        step.
      </p>

      <div className="grid grid-cols-1 gap-4 text-xs">
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-200 mb-1">
            Account & personal
          </p>
          <SummaryRow label="Email" value={values.email} />
          <SummaryRow label="Name" value={values.name} />
          <SummaryRow label="Location" value={values.location} />
          <SummaryRow label="Bio" value={values.bio} />
        </div>

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-200 mb-1">
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

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-200 mb-1">
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

        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-200 mb-1">
            Links
          </p>
          <SummaryRow label="LinkedIn" value={values.linkedinUrl} />
          <SummaryRow label="GitHub" value={values.githubUrl} />
          <SummaryRow label="Portfolio" value={values.portfolioUrl} />
        </div>
      </div>

      <p className="text-[0.7rem] text-slate-500 mt-2">
        By submitting, you confirm that your details are accurate and that your
        resume and links are up to date.
      </p>
    </div>
  );
};

export default SummaryStep;
