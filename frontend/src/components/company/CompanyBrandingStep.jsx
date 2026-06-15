import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyBrandingStep = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        Add your logo so candidates can quickly recognize your brand across the
        platform.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="logoUrl"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Logo URL (optional)
        </label>
        <input
          id="logoUrl"
          type="url"
          {...register("logoUrl")}
          className="input-glass text-sm sm:text-base py-3.5"
          placeholder="https://cdn.yourcompany.com/logo.png"
        />
      </div>

      <div className="space-y-2 pt-1">
        <label
          htmlFor="logoFile"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Upload logo file (optional)
        </label>
        <input
          id="logoFile"
          type="file"
          accept="image/*"
          {...register("logoFile")}
          className="block w-full text-sm text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border file:border-white/10 file:text-sm file:font-medium file:bg-white/[0.04] file:text-slate-300 hover:file:bg-white/[0.08] file:transition-colors file:cursor-pointer"
        />
        <p className="text-xs text-slate-500 mt-2">
          PNG or SVG recommended. For best results, use a square or horizontal
          logo with a transparent background.
        </p>
      </div>
    </div>
  );
};

export default CompanyBrandingStep;
