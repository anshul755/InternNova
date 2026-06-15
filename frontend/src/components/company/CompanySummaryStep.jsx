import React from "react";

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 text-sm py-2.5 border-b border-white/5 last:border-0">
    <span className="text-slate-400 min-w-[130px]">{label}</span>
    <span className="text-slate-200 text-right flex-1 break-words">
      {Array.isArray(value) ? value.join(", ") : value || "—"}
    </span>
  </div>
);

const CompanySummaryStep = ({ values }) => {
  return (
    <div className="space-y-5">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Review your company information before submitting. You can go back to
        adjust any step.
      </p>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Account
          </p>
          <SummaryRow label="Work email" value={values.email} />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Company basics
          </p>
          <SummaryRow label="Company name" value={values.companyName} />
          <SummaryRow label="Company size" value={values.companySize} />
          <SummaryRow label="Company type" value={values.companyType} />
          <SummaryRow label="Founded year" value={values.foundedYear} />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Description & website
          </p>
          <SummaryRow label="Description" value={values.companyDescription} />
          <SummaryRow label="Website" value={values.websiteUrl} />
        </div>

        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 space-y-1">
          <p className="text-xs font-semibold text-emerald-400/80 mb-2 uppercase tracking-wider">
            Branding
          </p>
          <SummaryRow label="Logo URL" value={values.logoUrl} />
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3">
        By submitting, you confirm that this company information is accurate and
        that you are authorized to create this employer account.
      </p>
    </div>
  );
};

export default CompanySummaryStep;
