import React from "react";
import { useFormContext } from "react-hook-form";

const years = Array.from({ length: 2100 - 1990 + 1 }, (_, i) => 1990 + i);

const EducationStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 3 · Education
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Share your current or most recent education details.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="university"
          className="block text-xs font-medium text-slate-300"
        >
          University<span className="text-rose-400"> *</span>
        </label>
        <input
          id="university"
          type="text"
          {...register("university")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.university
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
          }`}
          placeholder="Indian Institute of Technology, Delhi"
        />
        {errors.university && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.university.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="major"
          className="block text-xs font-medium text-slate-300"
        >
          Major / Program<span className="text-rose-400"> *</span>
        </label>
        <input
          id="major"
          type="text"
          {...register("major")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.major
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
          }`}
          placeholder="B.Tech Computer Science"
        />
        {errors.major && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.major.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="graduationYear"
            className="block text-xs font-medium text-slate-300"
          >
            Graduation year<span className="text-rose-400"> *</span>
          </label>
          <select
            id="graduationYear"
            {...register("graduationYear")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm transition-colors ${
              errors.graduationYear
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
            }`}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.graduationYear && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.graduationYear.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cgpa"
            className="block text-xs font-medium text-slate-300"
          >
            CGPA (0.0 - 10.0)<span className="text-rose-400"> *</span>
          </label>
          <input
            id="cgpa"
            type="number"
            step="0.01"
            min="0"
            max="10"
            {...register("cgpa")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.cgpa
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
            }`}
            placeholder="8.5"
          />
          {errors.cgpa && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.cgpa.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationStep;
