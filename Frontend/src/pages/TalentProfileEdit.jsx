import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const EMPTY_FORM = {
  name: '',
  university: '',
  major: '',
  graduationYear: '',
  cgpa: '',
  skills: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  bio: '',
  location: '',
  preferredLocations: '',
  preferredIndustries: '',
  resumeUrl: '',
};

export default function TalentProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [avatarFile, setAvatarFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/talent/v1/${user.id}`);
        const data = await res.json();
        setForm({
          name: data.name || '',
          university: data.university || '',
          major: data.major || '',
          graduationYear: data.graduationYear || '',
          cgpa: data.cgpa ?? '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          bio: data.bio || '',
          location: data.location || '',
          preferredLocations: Array.isArray(data.preferredLocations)
            ? data.preferredLocations.join(', ')
            : '',
          preferredIndustries: Array.isArray(data.preferredIndustries)
            ? data.preferredIndustries.join(', ')
            : '',
          resumeUrl: data.resumeUrl || '',
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

  const toList = (value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: user.id,
        user: 'Talent',
        name: form.name.trim(),
        university: form.university.trim(),
        major: form.major.trim(),
        graduationYear: form.graduationYear.trim(),
        cgpa: form.cgpa === '' ? null : Number(form.cgpa),
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
        'data',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      );

      if (avatarFile) formData.append('avatar', avatarFile);
      if (resumeFile) formData.append('resume', resumeFile);

      try {
        await api.put(`/talent/v1/${user.id}`, formData);
      } catch (err) {
        const isNotFound = String(err?.message || '').includes('404');
        if (!isNotFound) throw err;
        await api.post('/talent/v1', formData);
      }
      setSuccess('Profile updated successfully.');
      setTimeout(() => navigate('/dashboard/talent', { replace: true }), 800);
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
          <h1 className="text-lg font-semibold">Edit Talent Profile</h1>
          <Link to="/dashboard/talent" className="text-sm text-slate-300 hover:text-white">
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="university" value={form.university} onChange={handleChange} required placeholder="University" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="major" value={form.major} onChange={handleChange} required placeholder="Major" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="graduationYear" value={form.graduationYear} onChange={handleChange} required placeholder="Graduation Year" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="cgpa" value={form.cgpa} onChange={handleChange} type="number" step="0.01" min="0" max="10" placeholder="CGPA" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="skills" value={form.skills} onChange={handleChange} required placeholder="Skills (comma separated)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} required placeholder="LinkedIn URL" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="githubUrl" value={form.githubUrl} onChange={handleChange} required placeholder="GitHub URL" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} placeholder="Portfolio URL" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="preferredLocations" value={form.preferredLocations} onChange={handleChange} placeholder="Preferred Locations (comma separated)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
            <input name="preferredIndustries" value={form.preferredIndustries} onChange={handleChange} placeholder="Preferred Industries (comma separated)" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded" />
          </div>

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Bio"
            rows={4}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="avatarFile" className="text-sm text-slate-400">Avatar</label>
              <input id="avatarFile" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full mt-1 text-sm" />
            </div>
            <div>
              <div className="flex justify-between items-center text-sm text-slate-400 mb-1">
                <label htmlFor="resumeFile">Resume</label>
                {form.resumeUrl && (
                  <a href={form.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    📄 View Current Resume
                  </a>
                )}
              </div>
              <input id="resumeFile" type="file" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm disabled:opacity-60"
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
