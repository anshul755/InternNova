import React from "react";
import { useFormContext } from "react-hook-form";

const PersonalInfoStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 2 - Personal information
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Tell us a bit about yourself. This helps companies quickly understand
        who you are.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block text-xs font-medium text-slate-600"
        >
          Full name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={`input-glass text-sm ${
            errors.name ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Alex Sharma"
        />
        {errors.name && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="bio"
          className="block text-xs font-medium text-slate-600"
        >
          Short bio
        </label>
        <textarea
          id="bio"
          rows={10}
          {...register("bio")}
          className="input-glass text-sm placeholder:text-slate-500 resize-none bio-scroll"
          placeholder="Summarize your interests, goals, and experience in 2-3 sentences."
        />
        {errors.bio && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.bio.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="location"
          className="block text-xs font-medium text-slate-600"
        >
          Current location
        </label>
        <input
          id="location"
          type="text"
          {...register("location")}
          className="input-glass text-sm"
          placeholder="City, Country"
        />
        {errors.location && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.location.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoStep;
