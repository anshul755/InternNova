import React from "react";
import { useFormContext } from "react-hook-form";
import GlassSelect from "../GlassSelect.jsx";

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
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedMajor = watch("majorOption");
  const degreeLevel = watch("degreeLevel");
  const majorOption = watch("majorOption");
  const graduationYear = watch("graduationYear");

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 3 - Education
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Share your current or most recent education details.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="university"
          className="block text-xs font-medium text-slate-600"
        >
          University<span className="text-rose-400"> *</span>
        </label>
        <input
          id="university"
          type="text"
          {...register("university")}
          className={`input-glass text-sm ${
            errors.university ? "border-rose-400" : "border-white/70"
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
          className="block text-xs font-medium text-slate-600"
        >
          Degree level<span className="text-rose-400"> *</span>
        </label>
        <GlassSelect
          label="Degree level"
          labelId="degreeLevel"
          value={degreeLevel}
          onValueChange={(nextValue) =>
            setValue("degreeLevel", nextValue, { shouldValidate: true })
          }
          placeholder="Select degree level"
          clearLabel="Select degree level"
          options={degreeLevels.map((level) => ({
            value: level,
            label: level,
          }))}
        />
        {errors.degreeLevel && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.degreeLevel.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="majorOption"
          className="block text-xs font-medium text-slate-600"
        >
          Major / Program<span className="text-rose-400"> *</span>
        </label>
        <GlassSelect
          label="Major / Program"
          labelId="majorOption"
          value={majorOption}
          onValueChange={(nextValue) =>
            setValue("majorOption", nextValue, { shouldValidate: true })
          }
          placeholder="Select major / program"
          clearLabel="Select major / program"
          options={majors.map((major) => ({
            value: major === "Other" ? "OTHER" : major,
            label: major,
          }))}
        />
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
            className="block text-xs font-medium text-slate-600"
          >
            Other major / program<span className="text-rose-400"> *</span>
          </label>
          <input
            id="majorOther"
            type="text"
            {...register("majorOther")}
            className={`input-glass text-sm ${
              errors.majorOther ? "border-rose-400" : "border-white/70"
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
            className="block text-xs font-medium text-slate-600"
          >
            Graduation year<span className="text-rose-400"> *</span>
          </label>
          <GlassSelect
            label="Graduation year"
            labelId="graduationYear"
            value={graduationYear}
            onValueChange={(nextValue) =>
              setValue("graduationYear", nextValue, { shouldValidate: true })
            }
            placeholder="Select year"
            clearLabel="Select year"
            options={years.map((year) => ({
              value: String(year),
              label: String(year),
            }))}
          />
          {errors.graduationYear && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.graduationYear.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cgpa"
            className="block text-xs font-medium text-slate-600"
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
            className={`input-glass text-sm ${
              errors.cgpa ? "border-rose-400" : "border-white/70"
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
