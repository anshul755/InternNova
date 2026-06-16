import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../lib/AuthContext.jsx";
import { CORE_API_BASE } from "../lib/serviceConfig.js";
import RegistrationShell from "../components/register/RegistrationShell.jsx";
import FormErrorBanner from "../components/FormErrorBanner.jsx";
import CompanyAccountStep from "../components/company/CompanyAccountStep.jsx";
import CompanyProfileStep from "../components/company/CompanyProfileStep.jsx";
import CompanyDescriptionStep from "../components/company/CompanyDescriptionStep.jsx";
import CompanyBrandingStep from "../components/company/CompanyBrandingStep.jsx";
import CompanySummaryStep from "../components/company/CompanySummaryStep.jsx";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const STORAGE_KEY = "inn_company_registration";
const currentYear = new Date().getFullYear();

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/(?=.*[a-z])/, "Must contain a lowercase letter")
  .regex(/(?=.*[A-Z])/, "Must contain an uppercase letter")
  .regex(/(?=.*\d)/, "Must contain a number")
  .regex(/(?=.*[@#$%^&+=!_])/, "Must contain a special character")
  .regex(/^\S*$/, "Password must not contain spaces");

const baseSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: passwordSchema,
  confirmPassword: z.string(),
  companyName: z.string().min(1, "Company name is required"),
  companySize: z.string().min(1, "Company size is required"),
  companyType: z.string().min(1, "Company type is required"),
  foundedYear: z
    .string()
    .min(4, "Enter a valid year")
    .refine((val) => {
      const year = Number(val);
      return year >= 1800 && year <= currentYear;
    }, `Founded year must be between 1800 and ${currentYear}`),
  companyDescription: z
    .string()
    .min(10, "Please add at least a short description"),
  websiteUrl: z.string().url("Enter a valid website URL"),
  logoUrl: z
    .string()
    .url("Enter a valid logo URL")
    .optional()
    .or(z.literal("")),
  logoFile: z.any().optional(),
});

const schema = baseSchema
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      const hasUrl = typeof data.logoUrl === "string" && data.logoUrl.trim() !== "";
      const hasFile = data.logoFile && (
        (typeof FileList !== "undefined" && data.logoFile instanceof FileList && data.logoFile.length > 0) ||
        (Array.isArray(data.logoFile) && data.logoFile.length > 0) ||
        (typeof File !== "undefined" && data.logoFile instanceof File) ||
        (typeof data.logoFile === "object" && data.logoFile.name)
      );
      return hasUrl || hasFile;
    },
    {
      message: "Either a logo URL or a logo file is required",
      path: ["logoUrl"],
    },
  );

const steps = [
  { id: "account", label: "Account" },
  { id: "company", label: "Company" },
  { id: "description", label: "About" },
  { id: "branding", label: "Branding" },
  { id: "review", label: "Review" },
];

const stepFields = [
  ["email", "password", "confirmPassword"],
  ["companyName", "companySize", "companyType", "foundedYear"],
  ["companyDescription", "websiteUrl"],
  ["logoUrl", "logoFile"],
  [],
];

const stepDescriptions = [
  {
    title: "Secure your account",
    desc: "Create the login your hiring team will use to manage internships.",
  },
  {
    title: "Company basics",
    desc: "Add the details candidates need to understand your organization at a glance.",
  },
  {
    title: "About your company",
    desc: "A clear description and website link make your opportunities feel credible.",
  },
  {
    title: "Brand presence",
    desc: "A recognizable logo helps candidates identify your company across InternNova.",
  },
  {
    title: "Review and publish",
    desc: "Confirm the profile before you start posting internships.",
  },
];

const defaultValues = {
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
};

function loadSavedData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveData(values) {
  try {
    const safe = { ...values, logoFile: null };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    /* ignore */
  }
}

function clearSavedData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const CompanyRegister = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [authUserId, setAuthUserId] = useState(null);

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: loadSavedData() || defaultValues,
    mode: "onBlur",
  });

  const { handleSubmit, trigger, getValues, watch } = methods;
  const formValues = watch();
  const isLastStep = activeStep === steps.length - 1;

  useEffect(() => {
    saveData(formValues);
  }, [formValues]);

  const handleNext = async () => {
    setSubmitError("");
    const fields = stepFields[activeStep] || [];
    if (fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onInvalid = useCallback(
    (errors) => {
      const errorFields = Object.keys(errors);
      for (let i = 0; i < stepFields.length; i++) {
        const fields = stepFields[i];
        if (fields.length > 0 && fields.some((f) => errorFields.includes(f))) {
          setActiveStep(i);
          break;
        }
      }
      setSubmitError("Please fix the highlighted fields before submitting.");
    },
    [stepFields],
  );

  const handleBack = () => {
    setSubmitError("");
    if (activeStep === 0) {
      navigate("/register");
      return;
    }
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError("");

    try {
      let userId = authUserId;
      let emailSent = true;
      if (!userId) {
        const result = await authRegister(data.email, data.password, "Company");
        userId = result.userId;
        emailSent = result.emailSent !== false;
        setAuthUserId(userId);
      }

      const profilePayload = {
        id: userId,
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
        new Blob([JSON.stringify(profilePayload)], {
          type: "application/json",
        }),
      );

      const logoFile = data.logoFile?.[0];
      if (logoFile) formData.append("logo", logoFile);

      const response = await fetch(`${CORE_API_BASE}/company/v1`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let message = errorBody;
        try {
          const parsed = JSON.parse(errorBody);
          message = parsed.message || parsed.error || errorBody;
        } catch {
          /* keep raw response text */
        }
        throw new Error(message || "Profile creation failed");
      }

      clearSavedData();
      navigate("/verify-email", { state: { email: data.email, emailNotSent: !emailSent } });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStepStatus = useCallback(
    (index) => {
      const values = getValues();
      const result = schema.safeParse(values);
      const fieldErrors = result.success
        ? {}
        : result.error.flatten().fieldErrors;
      const requiredFields = stepFields[index] || [];
      const hasError = requiredFields.some(
        (field) => fieldErrors[field] && fieldErrors[field].length > 0,
      );

      if (index === activeStep) return "active";
      if (index < activeStep) return hasError ? "error" : "done";
      return "pending";
    },
    [activeStep, getValues],
  );

  const renderStepContent = () => {
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

  return (
    <RegistrationShell
      eyebrow="Company Registration"
      title="Set up your company profile"
      subtitle="Create a hiring profile candidates can trust before you post internships."
      steps={steps}
      activeStep={activeStep}
      getStepStatus={getStepStatus}
      descriptions={stepDescriptions}
      loginText="Already registered?"
    >
      <FormProvider {...methods}>
        <form onSubmit={(event) => event.preventDefault()} noValidate>
          <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-500">
                {steps[activeStep].label}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-50">
                {stepDescriptions[activeStep].title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 lg:hidden">
                {stepDescriptions[activeStep].desc}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
              {renderStepContent()}
            </div>

            <div className="mt-6">
              <FormErrorBanner
                message={submitError ? `Something went wrong — ${submitError}` : ""}
                onDismiss={() => setSubmitError("")}
                persistent
              >
                {authUserId && submitError && (
                  <p className="mt-1 text-xs opacity-70">
                    Your account was created. You can retry without losing
                    progress.
                  </p>
                )}
              </FormErrorBanner>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-8 lg:px-10">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IoChevronBack className="h-4 w-4" />
              {activeStep === 0 ? "Cancel" : "Back"}
            </button>

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={submitting}
                className="btn-primary px-6 py-3 text-sm"
              >
                Next
                <IoChevronForward className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit, onInvalid)}
                disabled={submitting}
                className="btn-primary px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Company Profile"
                )}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </RegistrationShell>
  );
};

export default CompanyRegister;
