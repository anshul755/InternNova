import { useState } from "react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import GlassSelect from "../components/GlassSelect.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import CurrencyToggle from "../components/CurrencyToggle.jsx";
import { useCurrency } from "../lib/CurrencyContext.jsx";
import Seo from "../components/Seo.jsx";

const JOB_TYPES = [
  "INTERNSHIP",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  requirements: "",
  responsibilities: "",
  skillsRequired: [],
  location: "",
  remoteOption: false,
  salaryMin: "",
  salaryMax: "",
  jobType: "INTERNSHIP",
  duration: "",
  startDate: "",
  applicationDeadline: "",
  selectionCriteria: "",
  status: "ACTIVE",
};

const PostJob = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skillsRequired.includes(trimmed)) {
      setForm((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, trimmed],
      }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const validateDates = () => {
    if (form.startDate && form.startDate < today) {
      return "Start date must be today or later";
    }

    if (form.applicationDeadline) {
      if (form.applicationDeadline < today) {
        return "Application deadline must be today or later";
      }
      if (form.startDate && form.applicationDeadline > form.startDate) {
        return "Application deadline must be on or before start date";
      }
    }

    return null;
  };

  const validate = () => {
    if (!user?.id) return "Session expired. Please log in again.";
    if (!form.title.trim()) return "Job title is required";
    if (!form.description.trim()) return "Description is required";
    if (form.skillsRequired.length === 0)
      return "At least one skill is required";
    if (!form.location.trim()) return "Location is required";
    if (!form.jobType) return "Job type is required";
    if (
      form.salaryMin &&
      form.salaryMax &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      return "Minimum salary cannot exceed maximum salary";
    }

    return validateDates();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      errorHandler.warning(validationError, { title: "Validation Warning" });
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const normalizedSkills = form.skillsRequired
        .map((skill) => skill.trim())
        .filter(Boolean);

      const payload = {
        companyId: String(user.id),
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        responsibilities: form.responsibilities.trim() || undefined,
        skillsRequired: normalizedSkills,
        location: form.location.trim(),
        remoteOption: form.remoteOption,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        jobType: form.jobType,
        duration: form.duration.trim() || undefined,
        startDate: form.startDate || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        selectionCriteria: form.selectionCriteria
          ? form.selectionCriteria.trim()
          : "",
        status: form.status,
      };

      await api.post("/jobs/v1", payload);
      errorHandler.success("Job posted successfully!");
      navigate("/dashboard/company");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to post job. Please try again." });
      setError(err.message || "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | Post Job" description="Create and publish a new job posting to attract top early-career talent." path="/jobs/create" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Post a New Job</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Fill in the details to attract the best candidates
          </p>
        </div>
        <Link
          to="/dashboard/company"
          className="btn-secondary px-5 py-2.5 text-sm font-medium self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Basic Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Job Type *
              </label>
              <GlassSelect
                label="Job Type"
                value={form.jobType}
                onValueChange={(nextValue) =>
                  setForm((prev) => ({ ...prev, jobType: nextValue }))
                }
                placeholder="Select job type"
                clearLabel="Select job type"
                showClearOption={false}
                options={JOB_TYPES.map((t) => ({
                  value: t,
                  label: t.replace("_", " "),
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Job Status *
              </label>
              <GlassSelect
                label="Job Status"
                value={form.status}
                onValueChange={(nextValue) =>
                  setForm((prev) => ({ ...prev, status: nextValue }))
                }
                placeholder="Select status"
                clearLabel="Select status"
                showClearOption={false}
                options={[
                  { value: "DRAFT", label: "Draft (Not public)" },
                  { value: "ACTIVE", label: "Active (Accepting applications)" },
                  {
                    value: "CLOSED",
                    label: "Closed (Hidden, no new applications)",
                  },
                  { value: "ARCHIVED", label: "Archived (Hidden, completed)" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 3 months, 6 months"
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="remoteOption"
                  checked={form.remoteOption}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/60 bg-white/60 text-emerald-600 focus:ring-emerald-200"
                />
                <span className="text-slate-600 text-sm font-medium">
                  Remote work available
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Min Monthly Salary ({currency}){" "}
                <CurrencyToggle />
              </label>
              <input
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
                placeholder="e.g. 3000"
                min="0"
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Max Monthly Salary ({currency})
              </label>
              <input
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
                placeholder="e.g. 6000"
                min="0"
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                min={today}
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={form.applicationDeadline}
                onChange={handleChange}
                min={today}
                max={form.startDate || undefined}
                className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
              />
            </div>
          </div>
        </div>
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Required Skills *
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Type a skill and press Enter or Add"
              className="flex-1 px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn-primary px-5 py-3 font-medium"
            >
              Add
            </button>
          </div>
          {form.skillsRequired.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.skillsRequired.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-slate-900 border border-brand-200 rounded-lg text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-slate-700 hover:text-rose-500 transition-colors font-bold leading-none"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Describe the role, the team, and what the candidate will be doing..."
              className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Responsibilities
            </label>
            <textarea
              name="responsibilities"
              value={form.responsibilities}
              onChange={handleChange}
              rows={5}
              placeholder="List the key responsibilities for this role..."
              className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Requirements
            </label>
            <textarea
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              rows={5}
              placeholder="List education, experience, and other requirements..."
              className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Internal Selection Criteria{" "}
              <span className="text-xs text-slate-500 font-normal">
                (Visible only to you)
              </span>
            </label>
            <textarea
              name="selectionCriteria"
              value={form.selectionCriteria}
              onChange={handleChange}
              rows={4}
              placeholder="Enter AI model training hints, targeted keywords, or private shortlisting criteria..."
              className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 resize-y"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full sm:w-auto justify-center px-8 py-3 font-semibold disabled:opacity-60 disabled:cursor-not-allowed text-center"
          >
            {submitting ? "Posting..." : "Post Job"}
          </button>
          <Link
            to="/dashboard/company"
            className="btn-secondary w-full sm:w-auto justify-center px-8 py-3 font-medium text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
