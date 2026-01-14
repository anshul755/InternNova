import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyDescriptionStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 3 - Description & website
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Help candidates understand your mission, culture, and where to learn
        more about you.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="companyDescription"
          className="block text-xs font-medium text-slate-300"
        >
          Company description<span className="text-rose-400"> *</span>
        </label>
        <textarea
          id="companyDescription"
          rows={6}
          {...register("companyDescription")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400 resize-none bio-scroll ${
            errors.companyDescription
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700"
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
          className="block text-xs font-medium text-slate-300"
        >
          Website URL<span className="text-rose-400"> *</span>
        </label>
        <input
          id="websiteUrl"
          type="url"
          {...register("websiteUrl")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.websiteUrl
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
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
