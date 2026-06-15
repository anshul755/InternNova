import React from "react";
import { useFormContext } from "react-hook-form";
import GlassSelect from "../GlassSelect.jsx";
import FieldError from "../FieldError.jsx";

const currentYear = new Date().getFullYear();

const CompanyProfileStep = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const companySize = watch("companySize");
  const companyType = watch("companyType");

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Share the basics about your company so candidates understand who you
        are.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="companyName"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Company name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="companyName"
          type="text"
          {...register("companyName")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.companyName ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="InternNova Labs Pvt. Ltd."
        />
        <FieldError message={errors.companyName?.message} persistent />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="companySize"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Company size<span className="text-rose-400"> *</span>
          </label>
          <GlassSelect
            label="Company size"
            labelId="companySize"
            value={companySize}
            onValueChange={(nextValue) =>
              setValue("companySize", nextValue, { shouldValidate: true })
            }
            placeholder="Select size"
            clearLabel="Select size"
            options={[
              { value: "1-10", label: "1-10 employees" },
              { value: "11-50", label: "11-50 employees" },
              { value: "51-200", label: "51-200 employees" },
              { value: "201-500", label: "201-500 employees" },
              { value: "501-1000", label: "501-1000 employees" },
              { value: "1000+", label: "1000+ employees" },
            ]}
          />
          <FieldError message={errors.companySize?.message} persistent />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="companyType"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Company type<span className="text-rose-400"> *</span>
          </label>
          <GlassSelect
            label="Company type"
            labelId="companyType"
            value={companyType}
            onValueChange={(nextValue) =>
              setValue("companyType", nextValue, { shouldValidate: true })
            }
            placeholder="Select type"
            clearLabel="Select type"
            options={[
              { value: "Startup", label: "Startup" },
              { value: "SME", label: "SME" },
              { value: "Enterprise", label: "Enterprise" },
              { value: "Non-profit", label: "Non-profit" },
              { value: "Agency", label: "Agency / Consultancy" },
            ]}
          />
          <FieldError message={errors.companyType?.message} persistent />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="foundedYear"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Founded year<span className="text-rose-400"> *</span>
        </label>
        <input
          id="foundedYear"
          type="number"
          {...register("foundedYear")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.foundedYear ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="2015"
          min={1800}
          max={currentYear}
        />
        <FieldError message={errors.foundedYear?.message} persistent />
      </div>
    </div>
  );
};

export default CompanyProfileStep;
