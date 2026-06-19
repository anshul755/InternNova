import React from "react";
import { useFormContext } from "react-hook-form";
import FieldError from "../FieldError.jsx";

const LinksUploadsStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Add your professional links and upload optional files.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="linkedinUrl"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            LinkedIn profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="linkedinUrl"
            type="url"
            {...register("linkedinUrl")}
            className={`input-glass text-sm sm:text-base py-3.5 ${
              errors.linkedinUrl ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="https://linkedin.com/in/username"
          />
          <FieldError message={errors.linkedinUrl?.message} persistent />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="githubUrl"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            GitHub profile<span className="text-rose-400"> *</span>
          </label>
          <input
            id="githubUrl"
            type="url"
            {...register("githubUrl")}
            className={`input-glass text-sm sm:text-base py-3.5 ${
              errors.githubUrl ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="https://github.com/username"
          />
          <FieldError message={errors.githubUrl?.message} persistent />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="portfolioUrl"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Portfolio / personal site
        </label>
        <input
          id="portfolioUrl"
          type="url"
          {...register("portfolioUrl")}
          className={`input-glass text-sm sm:text-base py-3.5 ${
            errors.portfolioUrl ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="https://portfolio.com"
        />
        <FieldError message={errors.portfolioUrl?.message} persistent />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
        <div className="space-y-2">
          <label
            htmlFor="avatarFile"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Avatar file<span className="text-rose-400"> *</span>
          </label>
          <input
            id="avatarFile"
            type="file"
            accept="image/*"
            {...register("avatarFile")}
            className={`block w-full text-sm text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border file:text-sm file:font-medium file:transition-colors file:cursor-pointer ${
              errors.avatarFile
                ? "file:border-rose-400/50 file:bg-rose-500/[0.04]"
                : "file:border-white/10 file:bg-white/[0.04] hover:file:bg-white/[0.08]"
            } file:text-slate-300`}
          />
          <FieldError message={errors.avatarFile?.message} persistent />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="resumeFile"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Resume file
          </label>
          <input
            id="resumeFile"
            type="file"
            accept="application/pdf"
            {...register("resumeFile")}
            className={`block w-full text-sm text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border file:text-sm file:font-medium file:transition-colors file:cursor-pointer ${
              errors.resumeFile
                ? "file:border-rose-400/50 file:bg-rose-500/[0.04]"
                : "file:border-white/10 file:bg-white/[0.04] hover:file:bg-white/[0.08]"
            } file:text-slate-300`}
          />
          <FieldError message={errors.resumeFile?.message} persistent />
        </div>
      </div>
    </div>
  );
};

export default LinksUploadsStep;
