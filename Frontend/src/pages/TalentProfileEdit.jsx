import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ProfileEditSkeleton } from "../components/Skeleton.jsx";
import FormErrorBanner from "../components/FormErrorBanner.jsx";
import CrudSection from "../components/talent/CrudSection.jsx";
import {
  IoBriefcaseOutline,
  IoCodeSlashOutline,
  IoRibbonOutline,
  IoTrophyOutline,
} from "react-icons/io5";

const EMPTY_FORM = {
  name: "",
  university: "",
  major: "",
  graduationYear: "",
  cgpa: "",
  skills: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  bio: "",
  location: "",
  preferredLocations: "",
  preferredIndustries: "",
  resumeUrl: "",
};

export default function TalentProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sub-entity lists (managed separately via CrudSection)
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/talent/v1/${user.id}`);
        const data = await res.json();
        setForm({
          name: data.name || "",
          university: data.university || "",
          major: data.major || "",
          graduationYear: data.graduationYear || "",
          cgpa: data.cgpa ?? "",
          skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
          linkedinUrl: data.linkedinUrl || "",
          githubUrl: data.githubUrl || "",
          portfolioUrl: data.portfolioUrl || "",
          bio: data.bio || "",
          location: data.location || "",
          preferredLocations: Array.isArray(data.preferredLocations)
            ? data.preferredLocations.join(", ")
            : "",
          preferredIndustries: Array.isArray(data.preferredIndustries)
            ? data.preferredIndustries.join(", ")
            : "",
          resumeUrl: data.resumeUrl || "",
        });
        setExperience(Array.isArray(data.experience) ? data.experience : []);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
        setAchievements(Array.isArray(data.achievements) ? data.achievements : []);
      } catch (err) {
        const isNotFound = String(err?.message || "").includes("404");
        if (!isNotFound) {
          setError(err.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toList = (value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        id: user.id,
        user: "Talent",
        name: form.name.trim(),
        university: form.university.trim(),
        major: form.major.trim(),
        graduationYear: form.graduationYear.trim(),
        cgpa: form.cgpa === "" ? null : Number(form.cgpa),
        skills: toList(form.skills),
        linkedinUrl: form.linkedinUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        portfolioUrl: form.portfolioUrl.trim() || null,
        bio: form.bio.trim() || null,
        location: form.location.trim() || null,
        preferredLocations: toList(form.preferredLocations),
        preferredIndustries: toList(form.preferredIndustries),
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (avatarFile) formData.append("avatar", avatarFile);
      if (resumeFile) formData.append("resume", resumeFile);

      try {
        await api.put(`/talent/v1/${user.id}`, formData);
      } catch (err) {
        const isNotFound = String(err?.message || "").includes("404");
        if (!isNotFound) throw err;
        await api.post("/talent/v1", formData);
      }
      setSuccess("Profile updated successfully.");
      setTimeout(() => navigate("/dashboard/talent", { replace: true }), 800);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-white/60 border border-white/60 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all text-sm";

  if (loading) {
    return <ProfileEditSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">
          Edit Talent Profile
        </h1>
        <Link
          to="/dashboard/talent"
          className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6" noValidate>
        <FormErrorBanner
          message={error}
          onDismiss={() => setError("")}
        />
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
  placeholder="Full Name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              University *
            </label>
            <input
              name="university"
              value={form.university}
              onChange={handleChange}
  placeholder="University"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Major *
            </label>
            <input
              name="major"
              value={form.major}
              onChange={handleChange}
  placeholder="Major"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Graduation Year *
            </label>
            <input
              name="graduationYear"
              value={form.graduationYear}
              onChange={handleChange}
  placeholder="e.g. 2026"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              CGPA
            </label>
            <input
              name="cgpa"
              value={form.cgpa}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 8.5"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Skills *
            </label>
            <input
              name="skills"
              value={form.skills}
              onChange={handleChange}
  placeholder="React, Node.js, Python..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              LinkedIn URL *
            </label>
            <input
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
  placeholder="https://linkedin.com/in/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              GitHub URL *
            </label>
            <input
              name="githubUrl"
              value={form.githubUrl}
              onChange={handleChange}
  placeholder="https://github.com/..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Portfolio URL
            </label>
            <input
              name="portfolioUrl"
              value={form.portfolioUrl}
              onChange={handleChange}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Location
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, Country"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Preferred Locations
            </label>
            <input
              name="preferredLocations"
              value={form.preferredLocations}
              onChange={handleChange}
              placeholder="NYC, SF, Remote..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Preferred Industries
            </label>
            <input
              name="preferredIndustries"
              value={form.preferredIndustries}
              onChange={handleChange}
              placeholder="Tech, Finance..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            rows={4}
            className={inputClass}
          />
        </div>

        {/* ── Profile Sections (Experience, Projects, Certifications, Achievements) ── */}
        <div className="space-y-3">
          <CrudSection
            title="Experience"
            icon={IoBriefcaseOutline}
            items={experience}
            onItemsChange={setExperience}
            apiPath="/talent/v1/experience"
            fields={[
              { name: "company", label: "Company", placeholder: "e.g. Google", required: true },
              { name: "role", label: "Role", placeholder: "e.g. Frontend Intern", required: true },
              { name: "location", label: "Location", placeholder: "e.g. Bangalore, India" },
              { name: "startDate", label: "Start Date", type: "date" },
              { name: "endDate", label: "End Date", type: "date" },
              { name: "isCurrent", label: "I currently work here", type: "checkbox" },
              { name: "bulletPoints", label: "Key Contributions", type: "tags", placeholder: "Built X, Improved Y by 30%, Led Z initiative" },
            ]}
          />

          <CrudSection
            title="Projects"
            icon={IoCodeSlashOutline}
            items={projects}
            onItemsChange={setProjects}
            apiPath="/talent/v1/projects"
            fields={[
              { name: "name", label: "Project Name", placeholder: "e.g. Campus Connect", required: true },
              { name: "description", label: "Description", type: "textarea", placeholder: "What problem did it solve?" },
              { name: "techStack", label: "Tech Stack", type: "tags", placeholder: "React, Node.js, MongoDB" },
              { name: "liveUrl", label: "Live URL", type: "url", placeholder: "https://..." },
              { name: "repoUrl", label: "Repository URL", type: "url", placeholder: "https://github.com/..." },
              { name: "highlights", label: "Highlights", type: "tags", placeholder: "10k+ users, Featured on Product Hunt" },
            ]}
          />

          <CrudSection
            title="Certifications"
            icon={IoRibbonOutline}
            items={certifications}
            onItemsChange={setCertifications}
            apiPath="/talent/v1/certifications"
            fields={[
              { name: "name", label: "Certification Name", placeholder: "e.g. AWS Solutions Architect", required: true },
              { name: "issuer", label: "Issuer", placeholder: "e.g. Amazon Web Services" },
              { name: "issueDate", label: "Issue Date", type: "date" },
              { name: "credentialUrl", label: "Credential URL", type: "url", placeholder: "https://..." },
            ]}
          />

          <CrudSection
            title="Achievements"
            icon={IoTrophyOutline}
            items={achievements}
            onItemsChange={setAchievements}
            apiPath="/talent/v1/achievements"
            fields={[
              { name: "title", label: "Title", placeholder: "e.g. Won Smart India Hackathon", required: true },
              { name: "description", label: "Description", type: "textarea", placeholder: "Brief description of the achievement" },
              { name: "year", label: "Year", placeholder: "e.g. 2025" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="avatarFile"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Avatar
            </label>
            <input
              id="avatarFile"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full mt-1 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 file:text-sm file:font-medium file:bg-white/70 file:text-slate-700 hover:file:bg-white/80"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="resumeFile"
                className="text-xs font-medium text-slate-500"
              >
                Resume
              </label>
              {form.resumeUrl && (
                <a
                  href={form.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 hover:text-slate-900 text-xs font-medium"
                >
                  View Current Resume
                </a>
              )}
            </div>
            <input
              id="resumeFile"
              type="file"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 file:text-sm file:font-medium file:bg-white/70 file:text-slate-700 hover:file:bg-white/80"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-6 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Save Changes"}
          </button>
          <Link
            to="/dashboard/talent"
            className="btn-secondary px-4 py-2.5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
