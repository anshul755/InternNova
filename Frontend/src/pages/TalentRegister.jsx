import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../lib/AuthContext.jsx";
import AccountSetupStep from "../components/talent/AccountSetupStep.jsx";
import PersonalInfoStep from "../components/talent/PersonalInfoStep.jsx";
import EducationStep from "../components/talent/EducationStep.jsx";
import SkillsPreferencesStep from "../components/talent/SkillsPreferencesStep.jsx";
import LinksUploadsStep from "../components/talent/LinksUploadsStep.jsx";
import SummaryStep from "../components/talent/SummaryStep.jsx";

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
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),

  // Step 3
  university: z.string().min(1, "University is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  majorOption: z.string().min(1, "Major is required"),
  majorOther: z.string().optional(),
  graduationYear: z
    .string()
    .min(4, "Enter a valid year")
    .refine((val) => {
      const year = Number(val);
      return year >= 1900 && year <= 2100;
    }, "Graduation year must be between 1900 and 2100"),
  cgpa: z.string().refine((val) => {
    if (val === "" || val === undefined) return false;
    const num = Number(val);
    return !Number.isNaN(num) && num >= 0 && num <= 10;
  }, "CGPA must be between 0.0 and 10.0"),

  // Step 4
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  preferredLocations: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),

  // Step 5
  linkedinUrl: z.string().url("Enter a valid LinkedIn URL"),
  githubUrl: z.string().url("Enter a valid GitHub URL"),
  portfolioUrl: z
    .string()
    .url("Enter a valid portfolio URL")
    .optional()
    .or(z.literal("")),

  // File uploads (optional)
  avatarFile: z.any().optional(),
  resumeFile: z.any().optional(),
});

const schema = baseSchema
  .superRefine((data, ctx) => {
    if (data.majorOption === "OTHER") {
      if (!data.majorOther || data.majorOther.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["majorOther"],
          message: "Please enter your major / program",
        });
      }
    }
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const steps = [
  "Account Setup",
  "Personal Information",
  "Education",
  "Skills & Preferences",
  "Links & Uploads",
  "Review",
];

// Required fields that determine completion/error state for each step
const stepRequiredFields = [
  ["email", "password", "confirmPassword"], // Step 1
  ["name"], // Step 2
  ["university", "degreeLevel", "majorOption", "graduationYear", "cgpa"], // Step 3
  ["skills"], // Step 4
  ["linkedinUrl", "githubUrl"], // Step 5
  [], // Step 6 (Review has no own required fields)
];

const TalentRegister = ({ modal = false }) => {
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
      name: "",
      bio: "",
      location: "",
      university: "",
      degreeLevel: "",
      majorOption: "",
      majorOther: "",
      graduationYear: "",
      cgpa: "",
      skills: [],
      preferredLocations: [],
      preferredIndustries: [],
      linkedinUrl: "",
      githubUrl: "",
      portfolioUrl: "",
      avatarFile: null,
      resumeFile: null,
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
      fieldsToValidate = ["name", "bio", "location"]; // bio/location optional, but we keep for consistency
    } else if (activeStep === 2) {
      fieldsToValidate = [
        "university",
        "degreeLevel",
        "majorOption",
        "majorOther",
        "graduationYear",
        "cgpa",
      ];
    } else if (activeStep === 3) {
      fieldsToValidate = [
        "skills",
        "preferredLocations",
        "preferredIndustries",
      ];
    } else if (activeStep === 4) {
      fieldsToValidate = ["linkedinUrl", "githubUrl", "portfolioUrl"];
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
      await authRegister(data.email, data.password, "Talent");

      // Step 2: Send talent profile to Java backend (no credentials)
      const resolvedMajor =
        data.majorOption === "OTHER" ? data.majorOther : data.majorOption;

      const profilePayload = {
        user: "Talent",
        name: data.name,
        university: data.university,
        major: data.degreeLevel
          ? `${data.degreeLevel} - ${resolvedMajor}`
          : resolvedMajor,
        graduationYear: data.graduationYear,
        cgpa: Number(data.cgpa),
        skills: data.skills,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
        portfolioUrl: data.portfolioUrl || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        preferredLocations: data.preferredLocations || [],
        preferredIndustries: data.preferredIndustries || [],
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(profilePayload)], { type: "application/json" })
      );

      const avatarFile = data.avatarFile?.[0];
      const resumeFile = data.resumeFile?.[0];
      if (avatarFile) formData.append("avatar", avatarFile);
      if (resumeFile) formData.append("resume", resumeFile);

      const response = await fetch("http://localhost:8080/talent/v1", {
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
        return <AccountSetupStep />;
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <EducationStep />;
      case 3:
        return <SkillsPreferencesStep />;
      case 4:
        return <LinksUploadsStep />;
      case 5:
        return <SummaryStep values={values} />;
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
        {/* Top row: Workday-style horizontal stepper */}
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

        {/* Main row: left form + right checklist */}
        <div className="flex flex-col lg:flex-row">
          {/* Left panel: header + form */}
          <section className="flex-1 px-6 py-8 sm:px-10">
            <header className="mb-6">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Talent application
              </p>
              <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">
                Create your InternNova profile
              </h1>
              <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
                Follow the steps to complete your Workday-style application. You
                can review everything before submitting.
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

                {/* Navigation buttons */}
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
                        {submitting ? "Submitting..." : "Submit application"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </FormProvider>
          </section>

          {/* Right panel: guidance (only on first step) */}
          {activeStep === 0 && (
            <aside className="hidden lg:flex w-[40%] flex-col justify-between bg-[radial-gradient(circle_at_top,_#38bdf8_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#22c55e_0,_transparent_55%)] p-8 text-sm text-slate-50">
              <div>
                <h2 className="text-lg font-semibold">Application checklist</h2>
                <p className="mt-2 text-slate-100/85 text-xs">
                  Complete each step carefully. Your profile helps companies
                </p>
                <ul className="space-y-2 mt-4 text-slate-100/85 list-disc list-inside text-xs">
                  <li>Use your university email if possible.</li>
                  <li>
                    Highlight projects, internships, and leadership roles.
                  </li>
                  <li>Keep LinkedIn and GitHub links publicly accessible.</li>
                </ul>
              </div>

              <p className="mt-6 text-[0.8rem] text-slate-100/80">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-sky-100 underline underline-offset-4 decoration-sky-200 hover:text-white"
                >
                  Log in instead
                </Link>
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentRegister;
