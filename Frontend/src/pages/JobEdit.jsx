import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { Link, useNavigate, useParams } from "react-router-dom";
import GlassSelect from "../components/GlassSelect.jsx";

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

const JobEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/v1/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || "",
          description: data.description || "",
          requirements: data.requirements || "",
          responsibilities: data.responsibilities || "",
          skillsRequired: Array.isArray(data.skillsRequired)
            ? data.skillsRequired
            : [],
          location: data.location || "",
          remoteOption: data.remoteOption || false,
          salaryMin: data.salaryMin || "",
          salaryMax: data.salaryMax || "",
          jobType: data.jobType || "INTERNSHIP",
          duration: data.duration || "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          applicationDeadline: data.applicationDeadline
            ? data.applicationDeadline.split("T")[0]
            : "",
          selectionCriteria: data.selectionCriteria || "",
          status: data.status || "ACTIVE",
        });
      } catch (err) {
        setError(err.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

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

  const validate = () => {
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
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        companyId: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        responsibilities: form.responsibilities.trim() || undefined,
        skillsRequired: form.skillsRequired,
        location: form.location.trim(),
        remoteOption: form.remoteOption,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        jobType: form.jobType,
        duration: form.duration.trim() || undefined,
        startDate: form.startDate || undefined,
        applicationDeadline: form.applicationDeadline || undefined,
        selectionCriteria: form.selectionCriteria.trim() || undefined,
        status: form.status,
      };

      await api.put(`/jobs/v1/${id}`, payload);
      navigate("/dashboard/company");
    } catch (err) {
      setError(err.message || "Failed to update job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-enter flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="border-b border-white/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Edit Job Posting</h1>
          <Link
            to="/dashboard/company"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-2">
              Basic Info
            </h2>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Job Title*
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Employment Type*
                </label>
                <GlassSelect
                  label="Employment Type"
                  value={form.jobType}
                  onValueChange={(nextValue) =>
                    setForm((prev) => ({ ...prev, jobType: nextValue }))
                  }
                  placeholder="Select employment type"
                  clearLabel="Select employment type"
                  showClearOption={false}
                  options={JOB_TYPES.map((t) => ({
                    value: t,
                    label: t.replace("_", " "),
                  }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Job Status*
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
                    {
                      value: "ACTIVE",
                      label: "Active (Accepting applications)",
                    },
                    {
                      value: "CLOSED",
                      label: "Closed (Hidden, no new applications)",
                    },
                    {
                      value: "ARCHIVED",
                      label: "Archived (Hidden, completed)",
                    },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Location*
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remoteOption"
                name="remoteOption"
                checked={form.remoteOption}
                onChange={handleChange}
                className="w-4 h-4 bg-white/60 border-white/60 rounded focus:ring-emerald-200 text-emerald-600"
              />
              <label htmlFor="remoteOption" className="text-sm text-slate-600">
                This is a remote position
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-2">
              Details
            </h2>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Description*
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Internal Selection Criteria{" "}
                <span className="text-slate-500">(Visible only to you)</span>
              </label>
              <textarea
                name="selectionCriteria"
                value={form.selectionCriteria}
                onChange={handleChange}
                rows={3}
                placeholder="Enter AI model training hints, targeted keywords..."
                className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-900 border-b border-slate-100 pb-2">
              Skills & Compensation
            </h2>

            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">
                Required Skills*
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="bg-brand-100 text-slate-900 border border-brand-200 px-2 py-1 rounded-md text-xs flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-slate-900"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-primary px-4 py-2 text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Min Salary/Stipend
                </label>
                <input
                  name="salaryMin"
                  type="number"
                  value={form.salaryMin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Max Salary/Stipend
                </label>
                <input
                  name="salaryMax"
                  type="number"
                  value={form.salaryMax}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Duration
                </label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 3 months"
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Start Date
                </label>
                <input
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">
                  Application Deadline
                </label>
                <input
                  name="applicationDeadline"
                  type="date"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/60 border border-white/60 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-emerald-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/40">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Updating..." : "Update Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEdit;
