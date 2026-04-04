import React from "react";
import { useFormContext } from "react-hook-form";

const LinksUploadsStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 5 · Links & uploads
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Add your professional links and upload optional files.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="linkedinUrl"
            className="block text-xs font-medium text-slate-300"
          >
            LinkedIn profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="linkedinUrl"
            type="url"
            {...register("linkedinUrl")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.linkedinUrl
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
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
            className="block text-xs font-medium text-slate-300"
          >
            GitHub profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="githubUrl"
            type="url"
            {...register("githubUrl")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.githubUrl
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
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
          className="block text-xs font-medium text-slate-300"
        >
          Portfolio / personal site
        </label>
        <input
          id="portfolioUrl"
          type="url"
          {...register("portfolioUrl")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.portfolioUrl
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
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
            className="block text-xs font-medium text-slate-300"
          >
            Avatar file (optional)
          </label>
          <input
            id="avatarFile"
            type="file"
            accept="image/*"
            {...register("avatarFile")}
            className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="resumeFile"
            className="block text-xs font-medium text-slate-300"
          >
            Resume file (optional)
          </label>
          <input
            id="resumeFile"
            type="file"
            accept="application/pdf"
            {...register("resumeFile")}
            className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

export default LinksUploadsStep;
