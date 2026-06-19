import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ProfileEditSkeleton } from "../components/Skeleton.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import CrudSection from "../components/talent/CrudSection.jsx";
import { resolveLogoUrl } from "../lib/media.js";
import { profileCache } from "../components/AuthenticatedNavbar.jsx";
import {
  IoBriefcaseOutline,
  IoCodeSlashOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoLocationOutline,
  IoMailOutline,
  IoLogoLinkedin,
  IoLogoGithub,
  IoGlobeOutline,
  IoPencilOutline,
  IoDownloadOutline,
  IoOpenOutline,
  IoSchoolOutline,
  IoEyeOutline,
  IoSparklesOutline,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";
import Seo from "../components/Seo.jsx";

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

export default function TalentProfile() {
  const { user, requestDeleteProfile, verifyDeleteProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imgError, setImgError] = useState(false);

  // Sub-entity lists
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Delete profile verification state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteOtp, setDeleteOtp] = useState(Array(6).fill(""));
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const talentAvatarUrl = resolveLogoUrl(profile, profile?.data, user);

  useEffect(() => {
    setImgError(false);
  }, [talentAvatarUrl]);

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteStep(1);
    setDeleteOtp(Array(6).fill(""));
    setDeleteError("");
  };

  const handleSendDeleteOtp = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await requestDeleteProfile();
      setDeleteStep(2);
      errorHandler.success("Verification code sent to your registered email.");
    } catch (err) {
      setDeleteError(err.message || "Failed to send verification code. Please try again.");
      errorHandler.handle(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    const code = deleteOtp.join("");
    if (code.length !== 6) {
      setDeleteError("Verification code must be exactly 6 digits.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await verifyDeleteProfile(code);
      if (profile?.id) {
        profileCache.delete(profile.id);
      }
      errorHandler.success("Your profile and all data have been permanently deleted.");
      setShowDeleteModal(false);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Verification failed. Please try again.");
      errorHandler.handle(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/talent/v1/${user.id}`);
      const data = await res.json();
      setProfile(data);
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

  useEffect(() => {
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

      let updatedProfile = null;
      try {
        const putRes = await api.put(`/talent/v1/${user.id}`, formData);
        updatedProfile = await putRes.json();
      } catch (err) {
        const isNotFound = String(err?.message || "").includes("404");
        if (!isNotFound) throw err;
        const postRes = await api.post("/talent/v1", formData);
        updatedProfile = await postRes.json();
      }

      setSuccess("Profile updated successfully.");
      
      // Update local profile states
      setProfile(updatedProfile);
      
      // Update authenticated navbar profile cache so the header updates instantly
      const updatedAvatar = resolveLogoUrl(updatedProfile, updatedProfile?.data, user);
      profileCache.set(user.id, {
        displayName: updatedProfile.name || payload.name,
        avatarUrl: updatedAvatar || null,
      });

      // Fetch fresh data from backend
      await fetchProfile();
      errorHandler.success("Profile updated successfully.");

      setTimeout(() => {
        setIsEditing(false);
      }, 600);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to update profile" });
      setError(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-white/60 dark:bg-white/[0.03] border border-white/60 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500/40 transition-all text-sm";

  if (loading) {
    return (
      <>
        <Seo title="InternNova | Profile" description="Manage your talent profile, skills, education, and experience." path="/profile" />
        <ProfileEditSkeleton />
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | Profile" description="Manage your talent profile, skills, education, and experience." path="/profile" />
      {/* ── HEADER NAVIGATION ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-55">
            {isEditing ? "Edit Talent Profile" : "My Profile"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEditing
              ? "Keep your preferences, details, and resume files updated to land internships."
              : "This is how companies see your profile when you apply for roles."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link
            to="/dashboard/talent"
            className="btn-secondary w-full sm:w-auto justify-center px-4 py-2.5 text-sm font-medium shrink-0 whitespace-nowrap text-center"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              setError("");
              setSuccess("");
            }}
            className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-300 w-full sm:w-auto ${
              isEditing
                ? "btn-secondary"
                : "btn-primary hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isEditing ? (
              "View Profile"
            ) : (
              <>
                <IoPencilOutline className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        /* ─────────────────────────────────────────────────────────────────
           EDIT MODE (FORM VIEW)
           ───────────────────────────────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6" noValidate>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                University *
              </label>
              <input
                name="university"
                value={form.university}
                onChange={handleChange}
                placeholder="University"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Major *
              </label>
              <input
                name="major"
                value={form.major}
                onChange={handleChange}
                placeholder="Major"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Graduation Year *
              </label>
              <input
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
                placeholder="e.g. 2026"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Skills *
              </label>
              <input
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python..."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                LinkedIn URL *
              </label>
              <input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                GitHub URL *
              </label>
              <input
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
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

          {/* Sub-entity Lists */}
          <div className="space-y-4 pt-2">
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
                { name: "bulletPoints", label: "Key Contributions", type: "tags", placeholder: "Built X, Improved Y by 30%" },
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
                { name: "highlights", label: "Highlights", type: "tags", placeholder: "10k+ users" },
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
                { name: "title", label: "Title", placeholder: "e.g. Won SIH Hackathon", required: true },
                { name: "description", label: "Description", type: "textarea", placeholder: "Brief description of achievements" },
                { name: "year", label: "Year", placeholder: "e.g. 2025" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="avatarFile" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Avatar
              </label>
              <input
                id="avatarFile"
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="w-full mt-1 text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 dark:file:border-white/[0.08] file:text-sm file:font-medium file:bg-white/70 dark:file:bg-white/[0.03] file:text-slate-700 dark:file:text-slate-300 hover:file:bg-white/80"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="resumeFile" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resume File (PDF)
                </label>
                {form.resumeUrl && (
                  <a
                    href={form.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 text-xs font-semibold"
                  >
                    View Current Resume
                  </a>
                )}
              </div>
              <input
                id="resumeFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 dark:file:border-white/[0.08] file:text-sm file:font-medium file:bg-white/70 dark:file:bg-white/[0.03] file:text-slate-700 dark:file:text-slate-300 hover:file:bg-white/80"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-white/40 dark:border-white/[0.06] w-full">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto justify-center px-6 py-2.5 text-sm font-semibold disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              {submitting ? "Updating..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError("");
                setSuccess("");
              }}
              className="btn-secondary w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-semibold text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* ─────────────────────────────────────────────────────────────────
           VIEW MODE (FULL RESUME PROFILE)
           ───────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Core Info & Preferences */}
          <div className="contents lg:block lg:col-span-1 lg:space-y-6">
            
            {/* Core Card */}
            <div className="glass-panel p-6 text-center flex flex-col items-center order-1">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/30 shadow-md">
                {talentAvatarUrl && !imgError ? (
                  <img
                    src={talentAvatarUrl}
                    alt={profile?.name || "Talent profile"}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#c7f284] to-[#8bcf7a] flex items-center justify-center text-3xl font-bold text-slate-900">
                    {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">
                {profile?.name || "Talent Profile"}
              </h2>

              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 justify-center">
                <IoSchoolOutline className="w-4.5 h-4.5 shrink-0" />
                {profile?.university || "Education details pending"}
              </p>
              
              {profile?.major && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.major} • Class of {profile.graduationYear || "N/A"}
                </p>
              )}

              {profile?.cgpa && (
                <span className="inline-block mt-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                  CGPA: {profile.cgpa} / 10.0
                </span>
              )}

              {/* Contact Information & Socials */}
              <div className="w-full border-t border-black/5 dark:border-white/5 mt-5 pt-5 space-y-3 text-left">
                <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                  <IoMailOutline className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                {profile?.location && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                    <IoLocationOutline className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {/* Social Circles */}
                <div className="flex gap-2 pt-2 justify-center">
                  {profile?.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all"
                      aria-label="LinkedIn"
                    >
                      <IoLogoLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all"
                      aria-label="GitHub"
                    >
                      <IoLogoGithub className="w-5 h-5" />
                    </a>
                  )}
                  {profile?.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all"
                      aria-label="Portfolio"
                    >
                      <IoGlobeOutline className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences & Skills Card */}
            <div className="glass-panel p-6 space-y-5 order-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.skills?.length > 0 ? (
                    profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#7cc84a]/12 border border-[#7cc84a]/20 text-[#3b721c] dark:text-[#9fe870] px-3 py-1 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No skills listed</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                  Preferred Locations
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.preferredLocations?.length > 0 ? (
                    profile.preferredLocations.map((loc) => (
                      <span
                        key={loc}
                        className="rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-300 px-3 py-1 text-xs font-semibold"
                      >
                        {loc}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No locations selected</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2.5">
                  Preferred Industries
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.preferredIndustries?.length > 0 ? (
                    profile.preferredIndustries.map((ind) => (
                      <span
                        key={ind}
                        className="rounded-full bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-650 dark:text-slate-300 px-3 py-1 text-xs font-semibold"
                      >
                        {ind}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No industries selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications Card */}
            <div className="glass-panel p-6 order-6">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <IoRibbonOutline className="text-emerald-600 dark:text-emerald-400 w-4.5 h-4.5" />
                Certifications
              </h3>
              {certifications.length > 0 ? (
                <ul className="space-y-4">
                  {certifications.map((cert) => (
                    <li key={cert.id} className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {cert.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {cert.issuer} {cert.issueDate ? `• Issued ${new Date(cert.issueDate).toLocaleDateString()}` : ""}
                      </span>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold mt-1 flex items-center gap-0.5">
                          <IoOpenOutline className="w-3 h-3" /> View Credential
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No certifications added.</p>
              )}
            </div>

            {/* Achievements Card */}
            <div className="glass-panel p-6 order-7">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <IoTrophyOutline className="text-emerald-600 dark:text-emerald-400 w-4.5 h-4.5" />
                Achievements
              </h3>
              {achievements.length > 0 ? (
                <ul className="space-y-4">
                  {achievements.map((ach) => (
                    <li key={ach.id} className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                        {ach.title} {ach.year ? `(${ach.year})` : ""}
                      </span>
                      {ach.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {ach.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No achievements added.</p>
              )}
            </div>

            {/* Danger Zone Card */}
            <div className="glass-panel p-6 border-red-500/20 dark:border-red-500/10 bg-red-500/[0.02] order-9">
              <h3 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <IoTrashOutline className="text-red-500 w-4.5 h-4.5" />
                Danger Zone
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Permanently delete your profile and all associated data from InternNova. This action is irreversible.
              </p>
              <button
                type="button"
                onClick={handleOpenDeleteModal}
                className="w-full justify-center px-4 py-2 text-xs font-semibold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/20 rounded-full transition-all duration-300 text-center"
              >
                Delete Profile
              </button>
            </div>
          </div>

          {/* Right Column: Bio, Timelines, Resume */}
          <div className="contents lg:block lg:col-span-2 lg:space-y-6">
            
            {/* Bio Card */}
            {profile?.bio && (
              <div className="glass-panel p-6 order-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                  <IoSparklesOutline className="text-emerald-500 w-4.5 h-4.5" />
                  Biography
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Experience Card */}
            <div className="glass-panel p-6 order-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-black/5 dark:border-white/5 pb-3 mb-4 flex items-center gap-2">
                <IoBriefcaseOutline className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                Work Experience
              </h3>
              
              {experience.length > 0 ? (
                <div className="space-y-6">
                  {experience.map((exp) => (
                    <div key={exp.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
                      <div className="absolute left-[-3px] top-[7px] w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {exp.role} @ <span className="text-emerald-600 dark:text-emerald-400">{exp.company}</span>
                        </h4>
                        <span className="text-xs text-slate-400 font-medium">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString() : ""} – {exp.isCurrent ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : ""}
                        </span>
                      </div>
                      {exp.location && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{exp.location}</p>
                      )}
                      {exp.bulletPoints?.length > 0 && (
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-350 mt-2 space-y-1">
                          {exp.bulletPoints.map((bp, i) => (
                            <li key={i}>{bp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No experience added. Click edit to add work experiences.</p>
              )}
            </div>

            {/* Projects Card */}
            <div className="glass-panel p-6 order-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-black/5 dark:border-white/5 pb-3 mb-4 flex items-center gap-2">
                <IoCodeSlashOutline className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                Key Projects
              </h3>
              
              {projects.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-white/40 dark:bg-white/[0.02] border border-white/60 dark:border-white/[0.06] rounded-xl flex flex-col justify-between h-full">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{proj.name}</h4>
                        {proj.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed truncate-3-lines">
                            {proj.description}
                          </p>
                        )}
                        {proj.techStack?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {proj.techStack.map((tech) => (
                              <span key={tech} className="bg-black/5 dark:bg-white/5 rounded px-2 py-0.5 text-[0.65rem] text-slate-500 dark:text-slate-400 font-semibold">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/5">
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1">
                            <IoOpenOutline className="w-3.5 h-3.5" /> Live Demo
                          </a>
                        )}
                        {proj.repoUrl && (
                          <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
                            <IoLogoGithub className="w-3.5 h-3.5" /> Source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No projects listed yet.</p>
              )}
            </div>

            {/* Resume Showcase Card */}
            <div className="glass-panel p-6 order-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-center md:text-left items-center">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <IoOpenOutline className="text-emerald-650 dark:text-emerald-400 w-5 h-5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Resume Document</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View or download your uploaded PDF resume</p>
                  </div>
                </div>
                {form.resumeUrl ? (
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto justify-center">
                    <a
                      href={form.resumeUrl}
                      download
                      className="btn-primary w-full sm:w-auto justify-center !px-4.5 !py-2.5 !text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      <IoDownloadOutline className="w-3.5 h-3.5" /> Download
                    </a>
                    <a
                      href={form.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary w-full sm:w-auto justify-center !px-4.5 !py-2.5 !text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] text-center"
                    >
                      <IoEyeOutline className="w-3.5 h-3.5" /> Open Resume
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary w-full sm:w-auto justify-center !px-4.5 !py-2.5 !text-xs font-semibold hover:scale-[1.02] active:scale-[0.98] text-center"
                  >
                    Upload Resume
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── DELETE PROFILE MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 border-red-500/25 relative overflow-hidden shadow-2xl">
            <h3 className="text-lg font-bold text-slate-50 flex items-center gap-2 mb-3">
              <IoWarningOutline className="text-red-500 w-5.5 h-5.5 shrink-0" />
              Delete Profile
            </h3>
            
            {deleteStep === 1 ? (
              <>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  Are you absolutely sure you want to delete your InternNova profile?
                </p>
                <div className="p-3.5 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
                  <strong>Warning:</strong> This action is permanent and irreversible. All your data, including application history, resume, preferences, and login credentials, will be permanently erased from our system.
                </div>
                
                {deleteError && (
                  <p className="text-xs text-red-400 mb-4 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                    {deleteError}
                  </p>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
                    className="btn-secondary text-sm px-4 py-2 rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendDeleteOtp}
                    disabled={deleteLoading}
                    className="btn-primary bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-5 py-2 rounded-full disabled:opacity-60 flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  We sent a 6-digit verification code to <strong className="text-slate-100">{user?.email}</strong>. Please enter the code below to authorize profile deletion.
                </p>
                
                {deleteError && (
                  <p className="text-xs text-red-400 mb-4 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                    {deleteError}
                  </p>
                )}

                {/* 6 digit code inputs */}
                <div className="flex justify-center gap-2 mb-6" dir="ltr">
                  {deleteOtp.map((digit, i) => (
                    <input
                      key={i}
                      id={`delete-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const updated = [...deleteOtp];
                        updated[i] = val;
                        setDeleteOtp(updated);
                        
                        // Auto focus next
                        if (val && i < 5) {
                          const nextInput = document.getElementById(`delete-otp-${i + 1}`);
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !deleteOtp[i] && i > 0) {
                          const prevInput = document.getElementById(`delete-otp-${i - 1}`);
                          prevInput?.focus();
                        }
                      }}
                      className="w-12 h-12 rounded-xl text-center text-lg font-bold bg-white/[0.04] border border-white/10 text-slate-100 focus:outline-none focus:border-[#9fe870] transition-colors"
                    />
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    disabled={deleteLoading}
                    className="btn-secondary text-sm px-4 py-2 rounded-full"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleteLoading || deleteOtp.join("").length < 6}
                    className="btn-primary bg-red-600 hover:bg-red-500 text-white font-semibold text-sm px-5 py-2 rounded-full disabled:opacity-60 flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Verify & Delete Account"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
