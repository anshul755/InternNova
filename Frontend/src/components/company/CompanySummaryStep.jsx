import React from "react";

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-xs py-1.5 border-b border-slate-200/60 last:border-0">
    <span className="text-slate-500 min-w-[120px]">{label}</span>
    <span className="text-slate-800 text-right flex-1 break-words">
      {Array.isArray(value) ? value.join(", ") : value || "—"}
    </span>
  </div>
);

const CompanySummaryStep = ({ values }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 5 - Review and submit
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Review your company information before submitting. You can go back to
        adjust any step.
      </p>

      <div className="grid grid-cols-1 gap-4 text-xs">
        <div className="rounded-xl bg-white/70 border border-white/60 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-700 mb-1">
            Account
          </p>
          <SummaryRow label="Work email" value={values.email} />
        </div>

        <div className="rounded-xl bg-white/70 border border-white/60 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-700 mb-1">
            Company basics
          </p>
          <SummaryRow label="Company name" value={values.companyName} />
          <SummaryRow label="Company size" value={values.companySize} />
          <SummaryRow label="Company type" value={values.companyType} />
          <SummaryRow label="Founded year" value={values.foundedYear} />
        </div>

        <div className="rounded-xl bg-white/70 border border-white/60 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-700 mb-1">
            Description & website
          </p>
          <SummaryRow label="Description" value={values.companyDescription} />
          <SummaryRow label="Website" value={values.websiteUrl} />
        </div>

        <div className="rounded-xl bg-white/70 border border-white/60 p-3 space-y-1.5">
          <p className="text-[0.7rem] font-semibold text-slate-700 mb-1">
            Branding
          </p>
          <SummaryRow label="Logo URL" value={values.logoUrl} />
        </div>
      </div>

      <p className="text-[0.7rem] text-slate-500 mt-2">
        By submitting, you confirm that this company information is accurate and
        that you are authorized to create this employer account.
      </p>
    </div>
  );
};

export default CompanySummaryStep;
