import React from "react";
import { useFormContext } from "react-hook-form";

const AccountSetupStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-100 mb-1">
        Step 1 · Account setup
      </h2>
      <p className="text-[0.75rem] text-slate-400 mb-3">
        Create your login credentials. Use a strong password to protect your
        account.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-300"
        >
          Email<span className="text-rose-400"> *</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
            errors.email
              ? "border-rose-500/80 focus:border-rose-400"
              : "border-slate-700 focus:border-sky-400"
          }`}
          placeholder="you@studentmail.com"
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
            className="block text-xs font-medium text-slate-300"
          >
            Password<span className="text-rose-400"> *</span>
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.password
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
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
            className="block text-xs font-medium text-slate-300"
          >
            Confirm password<span className="text-rose-400"> *</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={`w-full rounded-lg bg-slate-950 border px-3 py-2 outline-none text-sm placeholder:text-slate-500 transition-colors ${
              errors.confirmPassword
                ? "border-rose-500/80 focus:border-rose-400"
                : "border-slate-700 focus:border-sky-400"
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

export default AccountSetupStep;
