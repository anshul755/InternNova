import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyBrandingStep = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 4 - Branding & logo
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Add your logo so candidates can quickly recognize your brand across the
        platform.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="logoUrl"
          className="block text-xs font-medium text-slate-300"
        >
          Logo URL (optional)
        </label>
        <input
          id="logoUrl"
          type="url"
          {...register("logoUrl")}
          className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 outline-none text-sm placeholder:text-slate-500 focus:border-sky-400"
          placeholder="https://cdn.yourcompany.com/logo.png"
        />
      </div>

      <div className="space-y-1.5 pt-1">
        <label
          htmlFor="logoFile"
          className="block text-xs font-medium text-slate-300"
        >
          Upload logo file (optional)
        </label>
        <input
          id="logoFile"
          type="file"
          accept="image/*"
          {...register("logoFile")}
          className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
        />
        <p className="text-[0.7rem] text-slate-500 mt-1">
          PNG or SVG recommended. For best results, use a square or horizontal
          logo with a transparent background.
        </p>
      </div>
    </div>
  );
};

export default CompanyBrandingStep;
