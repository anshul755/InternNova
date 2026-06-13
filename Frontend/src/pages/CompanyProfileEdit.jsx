import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ProfileEditSkeleton } from "../components/Skeleton.jsx";

const EMPTY_FORM = {
  companyName: "",
  companySize: "",
  companyDescription: "",
  foundedYear: "",
  companyType: "",
  websiteUrl: "",
  logoUrl: "",
};

export default function CompanyProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/company/v1/${user.id}`);
        const data = await res.json();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
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

      try {
        await api.put(`/company/v1/${user.id}`, formData);
      } catch (err) {
        const isNotFound = String(err?.message || "").includes("404");
        if (!isNotFound) throw err;
        await api.post("/company/v1", formData);
      }
      setSuccess("Profile updated successfully.");
      setTimeout(() => navigate("/dashboard/company", { replace: true }), 800);
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
          Edit Company Profile
        </h1>
        <Link
          to="/dashboard/company"
          className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Company Name *
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
              placeholder="Company Name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Company Size *
            </label>
            <input
              name="companySize"
              value={form.companySize}
              onChange={handleChange}
              required
              placeholder="e.g. 10-50"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Founded Year *
            </label>
            <input
              name="foundedYear"
              value={form.foundedYear}
              onChange={handleChange}
              type="number"
              min="1800"
              max={new Date().getFullYear()}
              required
              placeholder="YYYY"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Industry / Type *
            </label>
            <input
              name="companyType"
              value={form.companyType}
              onChange={handleChange}
              required
              placeholder="e.g. Technology"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Website URL *
            </label>
            <input
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={handleChange}
              required
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Logo URL (Optional)
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
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Company Description *
          </label>
          <textarea
            name="companyDescription"
            value={form.companyDescription}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe your company..."
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="logoFile"
            className="block text-xs font-medium text-slate-500 mb-1"
          >
            Upload New Logo (Overwrites Logo URL)
          </label>
          <input
            id="logoFile"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/60 file:text-sm file:font-medium file:bg-white/70 file:text-slate-700 hover:file:bg-white/80"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-6 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Profile"}
          </button>
          <Link
            to="/dashboard/company"
            className="btn-secondary px-4 py-2.5 text-sm font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
