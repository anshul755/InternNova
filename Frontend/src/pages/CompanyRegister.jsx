import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../lib/AuthContext.jsx";
import CompanyAccountStep from "../components/company/CompanyAccountStep.jsx";
import CompanyProfileStep from "../components/company/CompanyProfileStep.jsx";
import CompanyDescriptionStep from "../components/company/CompanyDescriptionStep.jsx";
import CompanyBrandingStep from "../components/company/CompanyBrandingStep.jsx";
import CompanySummaryStep from "../components/company/CompanySummaryStep.jsx";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/(?=.*[a-z])/, "Must contain a lowercase letter")
  .regex(/(?=.*[A-Z])/, "Must contain an uppercase letter")
  .regex(/(?=.*\d)/, "Must contain a number")
  .regex(/(?=.*[@#$%^&+=!_])/, "Must contain a special character");

const baseSchema = z.object({
  // Step 1
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  confirmPassword: z.string(),

  // Step 2
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  companyType: z.string().min(1, "Company type is required"),
  foundedYear: z
    .string()
    .min(4, "Enter a valid year")
    .refine((val) => {
      const year = Number(val);
      return year >= 1800 && year <= 2100;
    }, "Founded year must be between 1800 and 2100"),

  // Step 3
  companyDescription: z
    .string()
    .min(10, "Please add at least a short description"),
  websiteUrl: z.string().url("Enter a valid website URL"),

  // Step 4
  logoUrl: z
    .string()
    .url("Enter a valid logo URL")
    .optional()
    .or(z.literal("")),
  logoFile: z.any().optional(),
});

const schema = baseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

const steps = [
  "Account Setup",
  "Company Details",
  "Description & Website",
  "Branding & Logo",
  "Review",
];

const stepRequiredFields = [
  ["email", "password", "confirmPassword"],
  ["companyName", "companySize", "companyType", "foundedYear"],
  ["companyDescription", "websiteUrl"],
  [],
  [],
];

const CompanyRegister = ({ modal = false }) => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      companySize: "",
      companyDescription: "",
      foundedYear: "",
      companyType: "",
      websiteUrl: "",
      logoUrl: "",
      logoFile: null,
    },
    mode: "onBlur",
  });

  const { handleSubmit, trigger, getValues } = methods;

  const isLastStep = activeStep === steps.length - 1;

  const handleNext = async () => {
    setSubmitError("");

    let fieldsToValidate = [];
    if (activeStep === 0) {
      fieldsToValidate = ["email", "password", "confirmPassword"];
    } else if (activeStep === 1) {
      fieldsToValidate = [
        "companyName",
        "companySize",
        "companyType",
        "foundedYear",
      ];
    } else if (activeStep === 2) {
      fieldsToValidate = ["companyDescription", "websiteUrl"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setSubmitError("");
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index) => {
    if (submitting) return;
    setActiveStep(index);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      // Step 1: Create auth account (email + password handled by Node service)
      await authRegister(data.email, data.password, "Company");

      // Step 2: Send company profile to Java backend (no credentials)
      const profilePayload = {
        user: "Company",
        companyName: data.companyName,
        companySize: data.companySize,
        companyDescription: data.companyDescription,
        foundedYear: Number(data.foundedYear),
        companyType: data.companyType,
        websiteUrl: data.websiteUrl,
        logoUrl: data.logoUrl || undefined,
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(profilePayload)], { type: "application/json" })
      );

      const logoFile = data.logoFile?.[0];
      if (logoFile) formData.append("logo", logoFile);

      const response = await fetch("http://localhost:8080/company/v1", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || "Profile creation failed");
      }

      // Step 3: Redirect to OTP verification
      navigate("/verify-email", { state: { email: data.email } });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    const values = getValues();
    switch (activeStep) {
      case 0:
        return <CompanyAccountStep />;
      case 1:
        return <CompanyProfileStep />;
      case 2:
        return <CompanyDescriptionStep />;
      case 3:
        return <CompanyBrandingStep />;
      case 4:
        return <CompanySummaryStep values={values} />;
      default:
        return null;
    }
  };

  const containerClasses = modal
    ? "w-full text-white flex items-center justify-center px-[2vw] py-4 font-sans"
    : "min-h-screen bg-[linear-gradient(135deg,#1923c4_0%,#0a5bff_40%,#0c1b66_100%)] text-white flex items-center justify-center px-[5vw] py-8 font-sans";

  return (
    <div className={containerClasses}>
      <div className="w-full max-w-6xl rounded-3xl bg-slate-950/70 border border-transparent overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 sm:px-10 border-b border-slate-800/80 bg-slate-950/80">
          <ol className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3 text-[0.7rem] sm:text-xs">
            {(() => {
              const values = getValues();
              const result = schema.safeParse(values);
              const fieldErrors = result.success
                ? {}
                : result.error.flatten().fieldErrors;

              return steps.map((label, index) => {
                const isActive = index === activeStep;
                const requiredFields = stepRequiredFields[index] || [];
                const hasError = requiredFields.some(
                  (field) => fieldErrors[field] && fieldErrors[field].length > 0
                );
                const isCompleted = index < activeStep && !hasError;
                const isError = index < activeStep && hasError;

                return (
                  <li key={label} className="flex-none">
                    <button
                      type="button"
                      onClick={() => handleStepClick(index)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors cursor-pointer select-none ${
                        isActive
                          ? "bg-sky-500/20 border-sky-400 text-sky-100"
                          : isCompleted
                          ? "bg-emerald-500/15 border-emerald-400 text-emerald-100"
                          : isError
                          ? "bg-rose-500/15 border-rose-400 text-rose-100"
                          : "bg-slate-900/60 border-slate-700 text-slate-400"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-semibold ${
                          isActive
                            ? "bg-sky-400 text-slate-950"
                            : isCompleted
                            ? "bg-emerald-400 text-slate-950"
                            : isError
                            ? "bg-rose-400 text-slate-950"
                            : "bg-slate-800 text-slate-200"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  </li>
                );
              });
            })()}
          </ol>
        </div>

        <div className="flex flex-col lg:flex-row">
          <section className="flex-1 px-6 py-8 sm:px-10">
            <header className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Company registration
              </p>
              <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">
                Create your InternNova company profile
              </h1>
              <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
                Follow the steps to set up your employer account, share your
                company story, and add your branding.
              </p>
            </header>

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 text-sm"
                noValidate
              >
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-5">
                  {renderStep()}
                </div>

                {submitError && (
                  <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-800 rounded-md px-3 py-2">
                    {submitError}
                  </p>
                )}

                {submitSuccess && (
                  <p className="text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-700 rounded-md px-3 py-2">
                    {submitSuccess}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStep === 0 || submitting}
                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                      activeStep === 0 || submitting
                        ? "border-slate-700 text-slate-600 cursor-not-allowed"
                        : "border-slate-600 text-slate-200 hover:bg-slate-800/80"
                    }`}
                  >
                    Back
                  </button>

                  <div className="flex gap-2">
                    {activeStep < steps.length - 1 && (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 text-slate-950 font-medium text-xs sm:text-sm px-4 py-2 hover:bg-sky-300 transition-transform hover:-translate-y-[1px] shadow-[0_10px_30px_rgba(56,189,248,0.45)]"
                      >
                        Next
                      </button>
                    )}

                    {isLastStep && (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 text-slate-950 font-medium text-xs sm:text-sm px-4 py-2 hover:bg-emerald-300 transition-transform hover:-translate-y-[1px] shadow-[0_10px_30px_rgba(52,211,153,0.45)] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Submit company profile"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </FormProvider>
          </section>

          {activeStep === 0 && (
            <aside className="hidden lg:flex w-[40%] flex-col justify-between bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#22c55e_0,_transparent_55%)] p-8 text-sm text-slate-50">
              <div>
                <h2 className="text-lg font-semibold">Built for lean teams</h2>
                <p className="mt-2 text-slate-100/85">
                  Post internships, review applicants, and coordinate interviews
                  without another heavy HR system.
                </p>
              </div>

              <p className="mt-6 text-[0.8rem] text-slate-100/80">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="text-sky-100 underline underline-offset-4 decoration-sky-200 hover:text-white"
                >
                  Log in
                </Link>
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyRegister;
