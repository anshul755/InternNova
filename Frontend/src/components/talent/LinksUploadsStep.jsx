import React from "react";
import { useFormContext } from "react-hook-form";

const LinksUploadsStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 5 - Links & uploads
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Add your professional links and upload optional files.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="linkedinUrl"
            className="block text-xs font-medium text-slate-600"
          >
            LinkedIn profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="linkedinUrl"
            type="url"
            {...register("linkedinUrl")}
            className={`input-glass text-sm ${
              errors.linkedinUrl ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="https://linkedin.com/in/username"
          />
          {errors.linkedinUrl && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.linkedinUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="githubUrl"
            className="block text-xs font-medium text-slate-600"
          >
            GitHub profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="githubUrl"
            type="url"
            {...register("githubUrl")}
            className={`input-glass text-sm ${
              errors.githubUrl ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="https://github.com/username"
          />
          {errors.githubUrl && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.githubUrl.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="portfolioUrl"
          className="block text-xs font-medium text-slate-600"
        >
          Portfolio / personal site
        </label>
        <input
          id="portfolioUrl"
          type="url"
          {...register("portfolioUrl")}
          className={`input-glass text-sm ${
            errors.portfolioUrl ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="https://portfolio.com"
        />
        {errors.portfolioUrl && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.portfolioUrl.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label
            htmlFor="avatarFile"
            className="block text-xs font-medium text-slate-600"
          >
            Avatar file (optional)
          </label>
          <input
            id="avatarFile"
            type="file"
            accept="image/*"
            {...register("avatarFile")}
            className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-white/60 file:text-xs file:font-medium file:bg-white/70 file:text-slate-700 hover:file:bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="resumeFile"
            className="block text-xs font-medium text-slate-600"
          >
            Resume file (optional)
          </label>
          <input
            id="resumeFile"
            type="file"
            accept="application/pdf"
            {...register("resumeFile")}
            className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-white/60 file:text-xs file:font-medium file:bg-white/70 file:text-slate-700 hover:file:bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default LinksUploadsStep;
