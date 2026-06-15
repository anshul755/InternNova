import React from "react";
import { useFormContext } from "react-hook-form";
import GlassSelect from "../GlassSelect.jsx";
import FieldError from "../FieldError.jsx";

const currentYear = new Date().getFullYear();
const maxGraduationYear = currentYear + 6;
const years = Array.from(
  { length: maxGraduationYear - 1990 + 1 },
  (_, i) => 1990 + i,
);

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
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Share your current or most recent education details.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="university"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          University<span className="text-rose-400"> *</span>
        </label>
        <input
          id="university"
          type="text"
          {...register("university")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.university ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Indian Institute of Technology, Delhi"
        />
        <FieldError message={errors.university?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="degreeLevel"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
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
        <FieldError message={errors.degreeLevel?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="majorOption"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
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
        <FieldError message={errors.majorOption?.message} persistent />
      </div>

      {selectedMajor === "OTHER" && (
        <div className="space-y-2">
          <label
            htmlFor="majorOther"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Other major / program<span className="text-rose-400"> *</span>
          </label>
          <input
            id="majorOther"
            type="text"
            {...register("majorOther")}
            className={`input-glass text-sm sm:text-base py-3.5 ${
              errors.majorOther ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="e.g. B.Sc Data Science"
          />
          <FieldError message={errors.majorOther?.message} persistent />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="graduationYear"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
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
          <FieldError message={errors.graduationYear?.message} persistent />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cgpa"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
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
            className={`input-glass text-sm sm:text-base py-3.5 ${
              errors.cgpa ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="8.5"
          />
          <FieldError message={errors.cgpa?.message} persistent />
        </div>
      </div>
    </div>
  );
};

export default EducationStep;
