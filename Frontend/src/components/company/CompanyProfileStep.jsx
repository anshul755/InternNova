import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyProfileStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 2 - Company details
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Share the basics about your company so candidates understand who you
        are.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="companyName"
          className="block text-xs font-medium text-slate-600"
        >
          Company name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="companyName"
          type="text"
          {...register("companyName")}
          className={`input-glass text-sm ${
            errors.companyName ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="InternNova Labs Pvt. Ltd."
        />
        {errors.companyName && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.companyName.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="companySize"
            className="block text-xs font-medium text-slate-600"
          >
            Company size<span className="text-rose-400"> *</span>
          </label>
          <select
            id="companySize"
            {...register("companySize")}
            className={`input-glass text-sm ${
              errors.companySize ? "border-rose-400" : "border-white/70"
            }`}
          >
            <option value="">Select size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
          {errors.companySize && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.companySize.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="companyType"
            className="block text-xs font-medium text-slate-600"
          >
            Company type<span className="text-rose-400"> *</span>
          </label>
          <select
            id="companyType"
            {...register("companyType")}
            className={`input-glass text-sm ${
              errors.companyType ? "border-rose-400" : "border-white/70"
            }`}
          >
            <option value="">Select type</option>
            <option value="Startup">Startup</option>
            <option value="SME">SME</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Non-profit">Non-profit</option>
            <option value="Agency">Agency / Consultancy</option>
          </select>
          {errors.companyType && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.companyType.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="foundedYear"
          className="block text-xs font-medium text-slate-600"
        >
          Founded year<span className="text-rose-400"> *</span>
        </label>
        <input
          id="foundedYear"
          type="number"
          {...register("foundedYear")}
          className={`input-glass text-sm ${
            errors.foundedYear ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="2015"
          min={1800}
          max={2100}
        />
        {errors.foundedYear && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.foundedYear.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompanyProfileStep;
