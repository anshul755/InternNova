import React from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const AccountSetupStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 mb-1">
        Step 1 - Account setup
      </h2>
      <p className="text-[0.75rem] text-slate-500 mb-3">
        Create your login credentials. Use a strong password to protect your
        account.
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-slate-600"
        >
          Email<span className="text-rose-400"> *</span>
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`input-glass text-sm ${
            errors.email ? "border-rose-400" : "border-white/70"
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
            className="block text-xs font-medium text-slate-600"
          >
            Password<span className="text-rose-400"> *</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`input-glass pr-12 text-sm ${
                errors.password ? "border-rose-400" : "border-white/70"
              }`}
              placeholder="8+ chars, Aa1@#$_"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
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
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`input-glass pr-12 text-sm ${
                errors.confirmPassword ? "border-rose-400" : "border-white/70"
              }`}
              placeholder="Re-enter password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-slate-500 hover:text-slate-700"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
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
