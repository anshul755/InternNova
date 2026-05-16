import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyDescriptionStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 3 - Description & website
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Help candidates understand your mission, culture, and where to learn
        more about you.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="companyDescription"
          className="block text-xs font-medium text-slate-600"
        >
          Company description<span className="text-rose-400"> *</span>
        </label>
        <textarea
          id="companyDescription"
          rows={6}
          {...register("companyDescription")}
          className={`input-glass text-sm resize-none bio-scroll ${
            errors.companyDescription ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Describe what your company does, your products or services, and what makes your internships unique."
        />
        {errors.companyDescription && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.companyDescription.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="websiteUrl"
          className="block text-xs font-medium text-slate-600"
        >
          Website URL<span className="text-rose-400"> *</span>
        </label>
        <input
          id="websiteUrl"
          type="url"
          {...register("websiteUrl")}
          className={`input-glass text-sm ${
            errors.websiteUrl ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="https://yourcompany.com"
        />
        {errors.websiteUrl && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.websiteUrl.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompanyDescriptionStep;
