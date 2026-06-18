import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../lib/AuthContext.jsx";
import { CORE_API_BASE } from "../lib/serviceConfig.js";
import RegistrationShell from "../components/register/RegistrationShell.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import AccountSetupStep from "../components/talent/AccountSetupStep.jsx";
import PersonalInfoStep from "../components/talent/PersonalInfoStep.jsx";
import EducationStep from "../components/talent/EducationStep.jsx";
import SkillsPreferencesStep from "../components/talent/SkillsPreferencesStep.jsx";
import LinksUploadsStep from "../components/talent/LinksUploadsStep.jsx";
import SummaryStep from "../components/talent/SummaryStep.jsx";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Seo from "../components/Seo.jsx";

const STORAGE_KEY = "inn_talent_registration";
const currentYear = new Date().getFullYear();
const maxGraduationYear = currentYear + 6;

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
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  location_country: z.string().optional(),
  location_state: z.string().optional(),
  location_city: z.string().optional(),
  university: z.string().min(1, "University is required"),
  degreeLevel: z.string().min(1, "Degree level is required"),
  majorOption: z.string().min(1, "Major is required"),
  majorOther: z.string().optional(),
  graduationYear: z
    .string()
    .min(4, "Enter a valid year")
    .refine((val) => {
      const year = Number(val);
      return year >= 1900 && year <= maxGraduationYear;
    }, `Graduation year must be between 1900 and ${maxGraduationYear}`),
  cgpa: z.string().refine((val) => {
    if (val === "" || val === undefined) return false;
    const num = Number(val);
    return !Number.isNaN(num) && num >= 0 && num <= 10;
  }, "CGPA must be between 0.0 and 10.0"),
  skills: z.array(z.string()).min(1, "Select at least one skill"),
  preferredLocations: z.array(z.string()).optional(),
  preferredIndustries: z.array(z.string()).optional(),
  linkedinUrl: z.string().url("Enter a valid LinkedIn URL"),
  githubUrl: z.string().url("Enter a valid GitHub URL"),
  portfolioUrl: z
    .string()
    .url("Enter a valid portfolio URL")
    .optional()
    .or(z.literal("")),
  avatarFile: z
    .any()
    .refine((files) => files && files.length > 0, "Avatar image is required"),
  resumeFile: z.any().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "You must accept the Terms of Service and Privacy Policy"),
});

const schema = baseSchema
  .superRefine((data, ctx) => {
    if (
      data.majorOption === "OTHER" &&
      (!data.majorOther || data.majorOther.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["majorOther"],
        message: "Please enter your major / program",
      });
    }
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const steps = [
  { id: "account", label: "Account" },
  { id: "personal", label: "Personal" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "links", label: "Links" },
  { id: "review", label: "Review" },
];

const stepFields = [
  ["email", "password", "confirmPassword"],
  ["name", "bio", "location", "location_country", "location_state", "location_city"],
  ["university", "degreeLevel", "majorOption", "majorOther", "graduationYear", "cgpa"],
  ["skills", "preferredLocations", "preferredIndustries"],
  ["linkedinUrl", "githubUrl", "portfolioUrl", "avatarFile", "resumeFile"],
  [],
];

const stepDescriptions = [
  {
    title: "Secure your account",
    desc: "Start with the login details you will use for applications and updates.",
  },
  {
    title: "Introduce yourself",
    desc: "Add your name, location, and a short bio so companies understand your profile quickly.",
  },
  {
    title: "Academic background",
    desc: "Education details help employers filter relevant internship candidates.",
  },
  {
    title: "Your strengths",
    desc: "Skills and preferences improve matching and keep recommendations relevant.",
  },
  {
    title: "Proof of work",
    desc: "LinkedIn, GitHub, portfolio, avatar, and resume links make the profile easier to trust.",
  },
  {
    title: "Review and submit",
    desc: "Check the details once, then submit your InternNova talent profile.",
  },
];

const defaultValues = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  bio: "",
  location: "",
  location_country: "",
  location_state: "",
  location_city: "",
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
  acceptTerms: false,
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
    const safe = { ...values, avatarFile: null, resumeFile: null };
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

const TalentRegister = () => {
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
      errorHandler.warning("Please fix the highlighted fields before submitting.");
      setSubmitError("Please fix the highlighted fields before submitting.");
    },
    [],
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
        const result = await authRegister(data.email, data.password, "Talent");
        userId = result.userId;
        emailSent = result.emailSent !== false;
        setAuthUserId(userId);
      }

      const resolvedMajor =
        data.majorOption === "OTHER" ? data.majorOther : data.majorOption;

      const profilePayload = {
        id: userId,
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
        new Blob([JSON.stringify(profilePayload)], {
          type: "application/json",
        }),
      );

      const avatarFile = data.avatarFile?.[0];
      const resumeFile = data.resumeFile?.[0];
      if (avatarFile) formData.append("avatar", avatarFile);
      if (resumeFile) formData.append("resume", resumeFile);

      const response = await fetch(`${CORE_API_BASE}/talent/v1`, {
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
      errorHandler.success("Profile created successfully!");
      navigate("/verify-email", { state: { email: data.email, emailNotSent: !emailSent } });
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Something went wrong. Please try again." });
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

  return (
    <RegistrationShell
      eyebrow="Talent Application"
      title="Create your profile"
      subtitle="A focused profile setup for internships, matching, and employer review."
      steps={steps}
      activeStep={activeStep}
      getStepStatus={getStepStatus}
      descriptions={stepDescriptions}
    >
      <Seo title="InternNova | Talent Registration" description="Create your talent profile and start matching with internships." path="/register/talent" />
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

            {authUserId && submitError && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Your account was created successfully. You can retry setting up your profile without losing progress.
              </div>
            )}
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
                disabled={submitting || !formValues.acceptTerms}
                className="btn-primary px-7 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </RegistrationShell>
  );
};

export default TalentRegister;
