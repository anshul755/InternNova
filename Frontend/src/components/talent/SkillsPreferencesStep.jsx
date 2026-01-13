import React from "react";
import { useFormContext } from "react-hook-form";

const SKILL_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Java",
  "Spring Boot",
  "Python",
  "Data Structures",
  "Algorithms",
  "UI/UX",
];

const LOCATION_OPTIONS = [
  "Remote",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Delhi NCR",
  "Mumbai",
];

const INDUSTRY_OPTIONS = [
  "Software",
  "FinTech",
  "EdTech",
  "Consulting",
  "Design",
  "AI/ML",
];

const MultiCheckboxGroup = ({ name, options, label }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const selected = watch(name) || [];

  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-medium text-slate-300">{label}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((option) => {
          const id = `${name}-${option}`;
          const isSelected = selected.includes(option);
          return (
            <label
              key={option}
              htmlFor={id}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[0.7rem] cursor-pointer transition-colors ${
                isSelected
                  ? "bg-sky-500/20 border-sky-400 text-sky-100"
                  : "bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              <input
                id={id}
                type="checkbox"
                value={option}
                className="hidden"
                {...register(name)}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
      {errors[name] && (
        <p className="text-[0.7rem] text-rose-400 mt-1">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
};

const SkillsPreferencesStep = () => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 4 · Skills & preferences
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Choose skills and preferences so we can match you with the right
        opportunities.
      </p>

      <MultiCheckboxGroup
        name="skills"
        options={SKILL_OPTIONS}
        label={
          <>
            Skills<span className="text-rose-400"> *</span>
          </>
        }
      />

      <MultiCheckboxGroup
        name="preferredLocations"
        options={LOCATION_OPTIONS}
        label="Preferred locations"
      />

      <MultiCheckboxGroup
        name="preferredIndustries"
        options={INDUSTRY_OPTIONS}
        label="Preferred industries"
      />

      {errors.skills && (
        <p className="text-[0.7rem] text-rose-400 mt-1">
          {errors.skills.message}
        </p>
      )}
    </div>
  );
};

export default SkillsPreferencesStep;
