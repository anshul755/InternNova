import React from "react";
import { useFormContext } from "react-hook-form";
import FieldError from "../FieldError.jsx";

const PersonalInfoStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Tell us a bit about yourself. This helps companies quickly understand
        who you are.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Full name<span className="text-rose-400"> *</span>
        </label>
        <input
          id="name"
          type="text"
          {...register("name")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.name ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="Alex Sharma"
        />
        <FieldError message={errors.name?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Short bio
        </label>
        <textarea
          id="bio"
          rows={10}
          {...register("bio")}
          className="input-glass text-sm sm:text-base placeholder:text-slate-500 resize-none bio-scroll py-3.5"
          placeholder="Summarize your interests, goals, and experience in 2-3 sentences."
        />
        <FieldError message={errors.bio?.message} persistent />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="location"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Current location
        </label>
        <input
          id="location"
          type="text"
          {...register("location")}
          className="input-glass text-sm sm:text-base py-3.5"
          placeholder="City, Country"
        />
        <FieldError message={errors.location?.message} persistent />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
