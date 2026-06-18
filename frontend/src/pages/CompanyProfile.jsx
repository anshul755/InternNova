import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ProfileEditSkeleton } from "../components/Skeleton.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import { resolveLogoUrl } from "../lib/media.js";
import { profileCache } from "../components/AuthenticatedNavbar.jsx";
import {
  IoPersonOutline,
  IoGlobeOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoPencilOutline,
  IoInformationCircleOutline,
  IoMailOutline,
} from "react-icons/io5";
import Seo from "../components/Seo.jsx";

const EMPTY_FORM = {
  companyName: "",
  companySize: "",
  companyDescription: "",
  foundedYear: "",
  companyType: "",
  websiteUrl: "",
  logoUrl: "",
};

export default function CompanyProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [profile, setProfile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const companyLogoUrl = resolveLogoUrl(profile, profile?.data, user);

  useEffect(() => {
    setImgError(false);
  }, [companyLogoUrl]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/company/v1/${user.id}`);
      const data = await res.json();
      setProfile(data);
      setForm({
        companyName: data.companyName || "",
        companySize: data.companySize || "",
        companyDescription: data.companyDescription || "",
        foundedYear: data.foundedYear || "",
        companyType: data.companyType || "",
        websiteUrl: data.websiteUrl || "",
        logoUrl: data.logoUrl || "",
      });
    } catch (err) {
      const isNotFound = String(err?.message || "").includes("404");
      if (!isNotFound) {
        errorHandler.handle(err, { fallbackMessage: "Failed to load company profile" });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const hasNewUrl = form.logoUrl && form.logoUrl.trim() !== "";
      const hasNewFile = logoFile !== null;
      const hasOldLogo = profile?.logoUrl && profile.logoUrl.trim() !== "";

      if (!hasNewUrl && !hasNewFile && !hasOldLogo) {
        throw new Error("Either a logo URL or a logo file is required.");
      }

      const payload = {
        id: user.id,
        user: "Company",
        companyName: form.companyName.trim(),
        companySize: form.companySize.trim(),
        companyDescription: form.companyDescription.trim(),
        foundedYear: Number(form.foundedYear),
        companyType: form.companyType.trim(),
        websiteUrl: form.websiteUrl.trim(),
        logoUrl: form.logoUrl.trim(),
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      if (logoFile) formData.append("logo", logoFile);

      let updatedProfile = null;
      try {
        const putRes = await api.put(`/company/v1/${user.id}`, formData);
        updatedProfile = await putRes.json();
      } catch (err) {
        const isNotFound = String(err?.message || "").includes("404");
        if (!isNotFound) throw err;
        const postRes = await api.post("/company/v1", formData);
        updatedProfile = await postRes.json();
      }

      errorHandler.success("Profile updated successfully.");
      setProfile(updatedProfile);

      // Update navbar cache map instantly
      const updatedLogo = resolveLogoUrl(updatedProfile, updatedProfile?.data, user);
      profileCache.set(user.id, {
        displayName: updatedProfile.companyName || payload.companyName,
        avatarUrl: updatedLogo || null,
      });

      await fetchProfile();

      setTimeout(() => {
        setIsEditing(false);
      }, 600);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to update profile" });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 bg-white/60 dark:bg-white/[0.03] border border-white/60 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 dark:focus:ring-emerald-500/20 dark:focus:border-emerald-500/40 transition-all text-sm";

  if (loading) {
    return (
      <>
        <Seo title="InternNova | Profile" description="Update your company profile, branding, and team information." path="/company/profile" />
        <ProfileEditSkeleton />
      </>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | Profile" description="Update your company profile, branding, and team information." path="/company/profile" />
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {isEditing ? "Edit Company Profile" : "Company Profile"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEditing
              ? "Share details about your mission, size, and branding to attract candidates."
              : "This is how applicants see your company information on job postings."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <Link
            to="/dashboard/company"
            className="btn-secondary w-full sm:w-auto justify-center px-4 py-2 text-sm font-medium shrink-0 whitespace-nowrap text-center"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
            }}
            className={`flex items-center justify-center gap-1.5 px-4.5 py-2 text-sm font-semibold rounded-full border transition-all duration-300 w-full sm:w-auto ${
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
           EDIT MODE
           ───────────────────────────────────────────────────────────────── */
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6" noValidate>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Company Name *
              </label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Company Size *
              </label>
              <input
                name="companySize"
                value={form.companySize}
                onChange={handleChange}
                placeholder="e.g. 10-50"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Founded Year *
              </label>
              <input
                name="foundedYear"
                value={form.foundedYear}
                onChange={handleChange}
                type="number"
                min="1800"
                max={new Date().getFullYear()}
                placeholder="YYYY"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Industry / Type *
              </label>
              <input
                name="companyType"
                value={form.companyType}
                onChange={handleChange}
                placeholder="e.g. Technology"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Website URL *
              </label>
              <input
                name="websiteUrl"
                value={form.websiteUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                Logo URL (Optional if file uploaded or logo exists)
              </label>
              <input
                name="logoUrl"
                value={form.logoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Company Description *
            </label>
            <textarea
              name="companyDescription"
              value={form.companyDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your company..."
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="logoFile" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
              Upload New Logo (Optional if URL provided or logo exists)
            </label>
            <input
              id="logoFile"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-650 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 dark:file:border-white/[0.08] file:text-sm file:font-medium file:bg-white/70 dark:file:bg-white/[0.03] file:text-slate-700 dark:file:text-slate-300 hover:file:bg-white/80"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-white/40 dark:border-white/[0.06] w-full">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:w-auto justify-center px-6 py-2.5 text-sm font-semibold disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              {submitting ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
              }}
              className="btn-secondary w-full sm:w-auto justify-center px-5 py-2.5 text-sm font-semibold text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* ─────────────────────────────────────────────────────────────────
           VIEW MODE
           ───────────────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Logo & Meta Info */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="glass-panel p-6 text-center flex flex-col items-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/30 shadow-md">
                {companyLogoUrl && !imgError ? (
                  <img
                    src={companyLogoUrl}
                    alt={profile?.companyName || "Company logo"}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-[#c7f284] to-[#8bcf7a] flex items-center justify-center text-3xl font-bold text-slate-900">
                    {profile?.companyName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-4">
                {profile?.companyName || "Company Profile"}
              </h2>

              <span className="inline-block mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                {profile?.companyType || "Industry details pending"}
              </span>

              {/* Sidebar Info Rows */}
              <div className="w-full border-t border-black/5 dark:border-white/5 mt-6 pt-5 space-y-4 text-left">
                {profile?.websiteUrl && (
                  <div className="flex items-center gap-3 text-sm">
                    <IoGlobeOutline className="w-5 h-5 text-slate-400 shrink-0" />
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-650 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold truncate flex items-center gap-1"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm text-slate-650 dark:text-slate-300">
                  <IoPeopleOutline className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>
                    Size: <strong>{profile?.companySize ? `${profile.companySize} employees` : "N/A"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-650 dark:text-slate-300">
                  <IoCalendarOutline className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>
                    Founded: <strong>{profile?.foundedYear || "N/A"}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-650 dark:text-slate-300">
                  <IoMailOutline className="w-5 h-5 text-slate-400 shrink-0" />
                  <span>
                    Email: <strong>{user?.email || "N/A"}</strong>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Bio / Description */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="glass-panel p-6 min-h-[300px]">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-black/5 dark:border-white/5 pb-3 mb-4 flex items-center gap-2">
                <IoInformationCircleOutline className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                About Company
              </h3>
              
              {profile?.companyDescription ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.companyDescription}
                </p>
              ) : (
                <div className="py-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                  <p className="text-xs text-slate-500 italic">No description added yet.</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary mt-3 text-xs !px-4 !py-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Add Description
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
