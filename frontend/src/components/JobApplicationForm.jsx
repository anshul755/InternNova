import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { useCurrency } from "../lib/CurrencyContext.jsx";
import CurrencyToggle from "./CurrencyToggle.jsx";
import FieldError from "./FieldError.jsx";
import { errorHandler } from "../lib/errorHandler.js";

const JobApplicationForm = ({ job, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [formData, setFormData] = useState({
    motivationStatement: "",
    resumeFile: null,
    additionalInfo: "",
    availableStartDate: "",
    expectedSalary: "",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2))
    .toISOString()
    .split("T")[0];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resumeFile") {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.motivationStatement.trim()) {
      newErrors.motivationStatement = "Please explain why you want to join this company";
    } else if (formData.motivationStatement.trim().split(/\s+/).length > 250) {
      newErrors.motivationStatement = "Please keep your answer to 250 words or less";
    }

    if (!formData.resumeFile) {
      newErrors.resumeFile = "Resume file is required";
    } else if (formData.resumeFile.size > 5 * 1024 * 1024) {
      newErrors.resumeFile = "Resume file must be less than 5MB";
    } else if (formData.resumeFile.type !== "application/pdf") {
      newErrors.resumeFile = "Resume must be a PDF";
    }

    if (!formData.availableStartDate) {
      newErrors.availableStartDate = "Available start date is required";
    } else if (formData.availableStartDate < today) {
      newErrors.availableStartDate = "Start date cannot be in the past";
    }

    if (formData.expectedSalary) {
      const salaryValue = Number(formData.expectedSalary);
      if (Number.isNaN(salaryValue) || salaryValue < 0) {
        newErrors.expectedSalary = "Expected salary must be a valid number";
      }
    }

    if (formData.portfolioUrl && !isValidUrl(formData.portfolioUrl)) {
      newErrors.portfolioUrl = "Please enter a valid URL";
    }

    if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = "Please enter a valid URL";
    }

    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user?.email || !job?.id) {
      errorHandler.error("Unable to submit application right now. Please refresh and try again.", { title: "Submission Error" });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          applicationData.append(key, formData[key]);
        }
      });

      applicationData.append("jobId", job.id);
      applicationData.append("userId", user.id);
      applicationData.append("userEmail", user.email);

      await onSubmit(applicationData);
    } catch (error) {
      console.error("Failed to submit application:", error);
      errorHandler.handle(error, { fallbackMessage: "Failed to submit application. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const companyName = job?.company?.companyName || job?.companyName || "this company";

  const formatSalary = (min, max) => {
    if (min == null && max == null) return "Salary not disclosed";
    const loc = currency === "₹" ? "en-IN" : "en-US";
    if (min != null && max != null)
      return `${currency}${Number(min).toLocaleString(loc)} – ${currency}${Number(max).toLocaleString(loc)}`;
    if (min != null) return `From ${currency}${Number(min).toLocaleString(loc)}`;
    return `Up to ${currency}${Number(max).toLocaleString(loc)}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24" style={{ background: 'var(--app-overlay)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="glass-panel p-8 max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--app-text)] mb-2">
            Apply for Position
          </h2>
          <div className="text-[var(--app-text-secondary)]">
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-[var(--app-text-muted)]">
              {job.company?.companyName || job.companyName || "Company"} •{" "}
              {job.location || "Location not specified"} •{" "}
              {formatSalary(job.salaryMin, job.salaryMax)}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="motivationStatement"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Why do you want to join {companyName}? *{" "}
                <span className="text-xs text-[var(--app-text-muted)]">
                  (up to 250 words)
                </span>
              </label>
              <textarea
                id="motivationStatement"
                name="motivationStatement"
                rows={8}
                value={formData.motivationStatement}
                onChange={handleInputChange}
                className={`input-glass placeholder:text-[var(--app-text-muted)] resize-vertical ${
                  errors.motivationStatement ? "!border-rose-400" : ""
                }`}
                placeholder={`I am excited about the opportunity to join ${companyName} because...

Share what draws you to this company:
• What about their mission, culture, or work excites you?
• How does this role align with your career goals?
• What unique value can you bring to their team?

Be genuine and specific — we read every response.`}
              />
              <FieldError
                message={errors.motivationStatement}
                id="motivationStatement-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, motivationStatement: "" }))
                }
              />
              <p className="mt-1 text-xs text-[var(--app-text-muted)]">
                {formData.motivationStatement.trim()
                  ? formData.motivationStatement.trim().split(/\s+/).length
                  : 0}{" "}
                / 250 words
              </p>
            </div>
            <div>
              <label
                htmlFor="resumeFile"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Resume *{" "}
                <span className="text-xs text-[var(--app-text-muted)]">
                  (text-based PDF, max 5MB)
                </span>
              </label>
              <input
                type="file"
                id="resumeFile"
                name="resumeFile"
                accept="application/pdf,.pdf"
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.resumeFile ? "!border-rose-400" : ""
                }`}
              />
              <FieldError
                message={errors.resumeFile}
                id="resumeFile-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, resumeFile: "" }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="availableStartDate"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Available Start Date *
              </label>
              <input
                type="date"
                id="availableStartDate"
                name="availableStartDate"
                value={formData.availableStartDate}
                min={today}
                max={maxDate}
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.availableStartDate
                    ? "!border-rose-400"
                    : ""
                }`}
              />
              <FieldError
                message={errors.availableStartDate}
                id="availableStartDate-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, availableStartDate: "" }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="expectedSalary"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Expected Monthly Salary ({currency}) <CurrencyToggle />
              </label>
              <input
                type="number"
                id="expectedSalary"
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.expectedSalary ? "!border-rose-400" : ""
                }`}
                placeholder="5000"
                min="0"
              />
              <FieldError
                message={errors.expectedSalary}
                id="expectedSalary-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, expectedSalary: "" }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="portfolioUrl"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.portfolioUrl ? "!border-rose-400" : ""
                }`}
                placeholder="https://yourportfolio.com"
              />
              <FieldError
                message={errors.portfolioUrl}
                id="portfolioUrl-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, portfolioUrl: "" }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="linkedinUrl"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                LinkedIn Profile
              </label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.linkedinUrl ? "!border-rose-400" : ""
                }`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <FieldError
                message={errors.linkedinUrl}
                id="linkedinUrl-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, linkedinUrl: "" }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                GitHub Profile
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className={`input-glass ${
                  errors.githubUrl ? "!border-rose-400" : ""
                }`}
                placeholder="https://github.com/yourusername"
              />
              <FieldError
                message={errors.githubUrl}
                id="githubUrl-error"
                onDismiss={() =>
                  setErrors((prev) => ({ ...prev, githubUrl: "" }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="additionalInfo"
                className="block text-sm font-medium text-[var(--app-text-secondary)] mb-2"
              >
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="input-glass resize-vertical"
                placeholder="Any additional information you'd like to share about your qualifications, projects, or why you're interested in this role..."
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-[var(--app-border)]">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="btn-secondary px-6 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-6 py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
