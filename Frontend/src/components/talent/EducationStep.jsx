import React from "react";
import { useFormContext } from "react-hook-form";

const years = Array.from({ length: 2100 - 1990 + 1 }, (_, i) => 1990 + i);

const degreeLevels = ["Bachelor", "Master", "PhD", "Diploma", "Other"];

const majors = [
  "Computer Science / CSE",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "AI / Data Science / ML",
  "Business / Management",
  "Design / UI-UX",
  "Other",
];

const EducationStep = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const selectedMajor = watch("majorOption");

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
          htmlFor="degreeLevel"
          className="block text-xs font-medium text-slate-300"
        >
          Degree level<span className="text-rose-400"> *</span>
        </label>
        <select
          id="degreeLevel"
          {...register("degreeLevel")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm transition-colors ${
            errors.degreeLevel
              ? "border-rose-500/80 focus:border-rose-400 text-slate-100"
              : "border-slate-700 focus:border-sky-400 text-slate-100"
          }`}
        >
          <option value="">Select degree level</option>
          {degreeLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {errors.degreeLevel && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.degreeLevel.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="majorOption"
          className="block text-xs font-medium text-slate-300"
        >
          Major / Program<span className="text-rose-400"> *</span>
        </label>
        <select
          id="majorOption"
          {...register("majorOption")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm transition-colors ${
            errors.majorOption
              ? "border-rose-500/80 focus:border-rose-400 text-slate-100"
              : "border-slate-700 focus:border-sky-400 text-slate-100"
          }`}
        >
          <option value="">Select major / program</option>
          {majors.map((major) => (
            <option key={major} value={major === "Other" ? "OTHER" : major}>
              {major}
            </option>
          ))}
        </select>
        {errors.majorOption && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.majorOption.message}
          </p>
        )}
      </div>

      {selectedMajor === "OTHER" && (
        <div className="space-y-1.5">
          <label
            htmlFor="majorOther"
            className="block text-xs font-medium text-slate-300"
          >
            Other major / program<span className="text-rose-400"> *</span>
          </label>
          <input
            id="majorOther"
            type="text"
            {...register("majorOther")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.majorOther
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
            }`}
            placeholder="e.g. B.Sc Data Science"
          />
          {errors.majorOther && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.majorOther.message}
            </p>
          )}
        </div>
      )}

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
