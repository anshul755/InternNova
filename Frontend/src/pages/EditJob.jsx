import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';

const EditJob = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skillsRequired: [],
    location: '',
    remoteOption: false,
    salaryMin: '',
    salaryMax: '',
    jobType: 'INTERNSHIP',
    duration: '',
    startDate: '',
    applicationDeadline: '',
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/v1/${id}`);
      const data = await res.json();
      
      // Authorization check (optional, but good practice)
      if (data.companyId !== user.id) {
        throw new Error("Unauthorized to edit this job");
      }

      setForm({
        title: data.title || '',
        description: data.description || '',
        requirements: data.requirements || '',
        responsibilities: data.responsibilities || '',
        skillsRequired: data.skillsRequired || [],
        location: data.location || '',
        remoteOption: data.remoteOption || false,
        salaryMin: data.salaryMin || '',
        salaryMax: data.salaryMax || '',
        jobType: data.jobType || 'INTERNSHIP',
        duration: data.duration || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split('T')[0] : '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skillsRequired.includes(trimmed)) {
      setForm(prev => ({ ...prev, skillsRequired: [...prev.skillsRequired, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm(prev => ({ ...prev, skillsRequired: prev.skillsRequired.filter(s => s !== skill) }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

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
      };

      await api.put(`/jobs/v1/${id}`, payload);
      navigate('/dashboard/company');
    } catch (err) {
      setError(err.message || 'Failed to update job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-white">Loading job details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Edit Job Posting</h1>
          <Link to="/dashboard/company" className="text-sm text-slate-400 hover:text-white">Cancel</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Job Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Job Type *</label>
                <select name="jobType" value={form.jobType} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Duration</label>
                <input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 months" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} required className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" name="remoteOption" checked={form.remoteOption} onChange={handleChange} className="bg-slate-800 border-slate-700 rounded text-blue-600" />
              <label className="text-sm text-slate-300">Remote work allowed</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Responsibilities</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Skills Required *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skillsRequired.map(skill => (
                  <span key={skill} className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-sm flex items-center">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-white">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} placeholder="Type a skill and press Enter" className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Add</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Min Salary ($)</label>
                <input type="number" name="salaryMin" value={form.salaryMin} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Max Salary ($)</label>
                <input type="number" name="salaryMax" value={form.salaryMax} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Application Deadline</label>
                <input type="date" name="applicationDeadline" value={form.applicationDeadline} onChange={handleChange} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating Job...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;