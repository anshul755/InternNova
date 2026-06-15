import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  IoCheckmarkCircle,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import FieldError from "../FieldError.jsx";

const AccountSetupStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-slate-400">
        Use an email you check often. We will send verification and application
        updates there.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Email
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`input-glass py-3.5 text-sm sm:text-base ${
              errors.email
                ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
                : ""
            }`}
            placeholder="you@studentmail.com"
          />
        </div>
        <FieldError message={errors.email?.message} persistent />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`input-glass py-3.5 pr-14 text-sm sm:text-base ${
                errors.password
                  ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
                  : ""
              }`}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-slate-200 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoEyeOffOutline className="w-5 h-5" />
              ) : (
                <IoEyeOutline className="w-5 h-5" />
              )}
            </button>
          </div>
          <FieldError message={errors.password?.message} persistent />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`input-glass py-3.5 pr-14 text-sm sm:text-base ${
                errors.confirmPassword
                  ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20"
                  : ""
              }`}
              placeholder="Re-enter your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 hover:text-slate-200 transition-colors"
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
          <FieldError message={errors.confirmPassword?.message} persistent />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Password Requirements
        </p>
        <ul className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
          {[
            "Minimum 8 characters",
            "One uppercase letter",
            "One lowercase letter",
            "One number",
            "One special character",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <IoCheckmarkCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AccountSetupStep;
