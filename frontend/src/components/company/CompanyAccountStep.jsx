import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoEllipseOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import FieldError from "../FieldError.jsx";

const CompanyAccountStep = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password") || "";

  const requirements = [
    { label: "Minimum 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character", met: /[@#$%^&+=!_]/.test(password) },
    { label: "No spaces allowed", met: password.length > 0 && !/\s/.test(password) },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm leading-6 text-slate-400">
        Use a shared recruiting email or the work email your hiring team checks
        most often.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
        >
          Work Email
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
            placeholder="you@company.com"
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
          {requirements.map((req) => {
            let icon;
            let textColor;
            if (password === "") {
              icon = <IoEllipseOutline className="h-4 w-4 shrink-0 text-slate-500" />;
              textColor = "text-slate-400";
            } else if (req.met) {
              icon = <IoCheckmarkCircle className="h-4 w-4 shrink-0 text-emerald-400" />;
              textColor = "text-slate-300";
            } else {
              icon = <IoCloseCircle className="h-4 w-4 shrink-0 text-rose-400" />;
              textColor = "text-slate-400";
            }

            return (
              <li key={req.label} className="flex items-center gap-2">
                {icon}
                <span className={`${textColor} transition-colors duration-300`}>
                  {req.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CompanyAccountStep;
