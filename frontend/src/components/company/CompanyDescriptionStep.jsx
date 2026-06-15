import React from "react";
import { useFormContext } from "react-hook-form";
import FieldError from "../FieldError.jsx";

const CompanyDescriptionStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Help candidates understand your mission, culture, and where to learn
        more about you.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="companyDescription"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Company description<span className="text-rose-400"> *</span>
        </label>
        <textarea
          id="companyDescription"
          rows={6}
          {...register("companyDescription")}
          className={`input-glass text-sm sm:text-base resize-none bio-scroll py-3.5 ${
            errors.companyDescription ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Describe what your company does, your products or services, and what makes your internships unique."
        />
        <FieldError message={errors.companyDescription?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="websiteUrl"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Website URL<span className="text-rose-400"> *</span>
        </label>
        <input
          id="websiteUrl"
          type="url"
          {...register("websiteUrl")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.websiteUrl ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="https://yourcompany.com"
        />
        <FieldError message={errors.websiteUrl?.message} persistent />
      </div>
    </div>
  );
};

export default CompanyDescriptionStep;
