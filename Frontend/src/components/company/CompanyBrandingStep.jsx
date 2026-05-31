import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyBrandingStep = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 4 - Branding & logo
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Add your logo so candidates can quickly recognize your brand across the
        platform.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="logoUrl"
          className="block text-xs font-medium text-slate-600"
        >
          Logo URL (optional)
        </label>
        <input
          id="logoUrl"
          type="url"
          {...register("logoUrl")}
          className="input-glass text-sm"
          placeholder="https://cdn.yourcompany.com/logo.png"
        />
      </div>

      <div className="space-y-1.5 pt-1">
        <label
          htmlFor="logoFile"
          className="block text-xs font-medium text-slate-600"
        >
          Upload logo file (optional)
        </label>
        <input
          id="logoFile"
          type="file"
          accept="image/*"
          {...register("logoFile")}
          className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
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
