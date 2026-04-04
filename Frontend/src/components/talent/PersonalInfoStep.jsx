import React from "react";
import { useFormContext } from "react-hook-form";

const PersonalInfoStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 2 · Personal information
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Tell us a bit about yourself. This helps companies quickly understand
        who you are.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block text-xs font-medium text-slate-300"
        >
          Full name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.name
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
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
          className="block text-xs font-medium text-slate-300"
        >
          Short bio
        </label>
        <textarea
          id="bio"
          rows={10}
          {...register("bio")}
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400 resize-none bio-scroll"
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
          className="block text-xs font-medium text-slate-300"
        >
          Current location
        </label>
        <input
          id="location"
          type="text"
          {...register("location")}
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
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
