import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const EMPTY_FORM = {
  companyName: '',
  companySize: '',
  companyDescription: '',
  foundedYear: '',
  companyType: '',
  websiteUrl: '',
  logoUrl: '',
};

export default function CompanyProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/company/v1/${user.id}`);
        const data = await res.json();
        setForm({
          companyName: data.companyName || '',
          companySize: data.companySize || '',
          companyDescription: data.companyDescription || '',
          foundedYear: data.foundedYear || '',
          companyType: data.companyType || '',
          websiteUrl: data.websiteUrl || '',
          logoUrl: data.logoUrl || '',
        });
      } catch (err) {
        const isNotFound = String(err?.message || '').includes('404');
        if (!isNotFound) {
          setError(err.message || 'Failed to load profile');
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
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: user.id,
        user: 'Company',
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
        'data',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );
      if (logoFile) formData.append('logo', logoFile);

      try {
        await api.put(`/company/v1/${user.id}`, formData);
      } catch (err) {
        const isNotFound = String(err?.message || '').includes('404');
        if (!isNotFound) throw err;
        await api.post('/company/v1', formData);
      }
      setSuccess('Profile updated successfully.');
      setTimeout(() => navigate('/dashboard/company', { replace: true }), 800);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Edit Company Profile</h1>
          <Link to="/dashboard/company" className="text-sm text-slate-300 hover:text-white">
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Name</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Company Name" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Company Size</label>
              <input name="companySize" value={form.companySize} onChange={handleChange} required placeholder="e.g. 10-50" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Founded Year</label>
              <input name="foundedYear" value={form.foundedYear} onChange={handleChange} type="number" min="1800" max={new Date().getFullYear()} required placeholder="YYYY" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Industry / Type</label>
              <input name="companyType" value={form.companyType} onChange={handleChange} required placeholder="e.g. Technology" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Website URL</label>
              <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} required placeholder="https://..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Logo URL (Optional)</label>
              <input name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Company Description</label>
            <textarea
              name="companyDescription"
              value={form.companyDescription}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your company..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="logoFile" className="block text-xs text-slate-400 mb-1">Upload New Logo (Overwrites Logo URL)</label>
            <input id="logoFile" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-blue-400 hover:file:bg-slate-700" />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
