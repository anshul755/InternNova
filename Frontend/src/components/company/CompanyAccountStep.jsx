import React from "react";
import { useFormContext } from "react-hook-form";

const CompanyAccountStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 1 - Account setup
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Create your login credentials using a work email and a strong password.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-600"
        >
          Work email<span className="text-rose-400"> *</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`input-glass text-sm ${
            errors.email ? "border-rose-400" : "border-white/70"
          }`}
          placeholder="you@company.com"
        />
        {errors.email && (
          <p className="text-[0.7rem] text-rose-400 mt-1">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-slate-600"
          >
            Password<span className="text-rose-400"> *</span>
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={`input-glass text-sm ${
              errors.password ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="8+ chars, Aa1@#$_"
          />
          {errors.password && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium text-slate-600"
          >
            Confirm password<span className="text-rose-400"> *</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={`input-glass text-sm ${
              errors.confirmPassword ? "border-rose-400" : "border-white/70"
            }`}
            placeholder="Re-enter password"
          />
          {errors.confirmPassword && (
            <p className="text-[0.7rem] text-rose-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <ul className="text-[0.7rem] text-slate-500 list-disc list-inside space-y-1 mt-1">
        <li>Minimum 8 characters.</li>
        <li>
          Include uppercase, lowercase, a number, and a special character.
        </li>
      </ul>
    </div>
  );
};

export default CompanyAccountStep;
