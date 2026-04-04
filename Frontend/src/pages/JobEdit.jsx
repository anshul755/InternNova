import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate, useParams } from 'react-router-dom';

const JOB_TYPES = ['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

const EMPTY_FORM = {
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
  selectionCriteria: '',
  status: 'ACTIVE',
};

const JobEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/v1/${id}`);
        const data = await res.json();
        setForm({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          responsibilities: data.responsibilities || '',
          skillsRequired: Array.isArray(data.skillsRequired) ? data.skillsRequired : [],
          location: data.location || '',
          remoteOption: data.remoteOption || false,
          salaryMin: data.salaryMin || '',
          salaryMax: data.salaryMax || '',
          jobType: data.jobType || 'INTERNSHIP',
          duration: data.duration || '',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          applicationDeadline: data.applicationDeadline ? data.applicationDeadline.split('T')[0] : '',
          selectionCriteria: data.selectionCriteria || '',
          status: data.status || 'ACTIVE',
        });
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

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

  const validate = () => {
    if (!form.title.trim()) return 'Job title is required';
    if (!form.description.trim()) return 'Description is required';
    if (form.skillsRequired.length === 0) return 'At least one skill is required';
    if (!form.location.trim()) return 'Location is required';
    if (!form.jobType) return 'Job type is required';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax)) {
      return 'Minimum salary cannot exceed maximum salary';
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
        selectionCriteria: form.selectionCriteria.trim() || undefined,
        status: form.status,
      };

      await api.put(`/jobs/v1/${id}`, payload);
      navigate('/dashboard/company');
    } catch (err) {
      setError(err.message || 'Failed to update job. Please try again.');
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
          <h1 className="text-lg font-semibold">Edit Job Posting</h1>
          <Link to="/dashboard/company" className="text-sm text-slate-300 hover:text-white">
            Cancel
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {error && <div className="p-4 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">{error}</div>}
          
          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-200 border-b border-slate-800 pb-2">Basic Info</h2>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Job Title*</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Employment Type*</label>
                <select name="jobType" value={form.jobType} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500">
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Job Status*</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500">
                  <option value="DRAFT">Draft (Not public)</option>
                  <option value="ACTIVE">Active (Accepting applications)</option>
                  <option value="CLOSED">Closed (Hidden, no new applications)</option>
                  <option value="ARCHIVED">Archived (Hidden, completed)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Location*</label>
                <input name="location" value={form.location} onChange={handleChange} required className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remoteOption" name="remoteOption" checked={form.remoteOption} onChange={handleChange} className="w-4 h-4 bg-slate-800 border-slate-700 rounded focus:ring-offset-slate-900 icon-checkbox" />
              <label htmlFor="remoteOption" className="text-sm text-slate-300">This is a remote position</label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-200 border-b border-slate-800 pb-2">Details</h2>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description*</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Responsibilities</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Internal Selection Criteria <span className="text-slate-500">(Visible only to you)</span>
              </label>
              <textarea name="selectionCriteria" value={form.selectionCriteria} onChange={handleChange} rows={3} placeholder="Enter AI model training hints, targeted keywords..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-medium text-slate-200 border-b border-slate-800 pb-2">Skills & Compensation</h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Required Skills*</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skillsRequired.map(skill => (
                  <span key={skill} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-xs flex items-center">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-white">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-sm">Add</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Min Salary/Stipend</label>
                <input name="salaryMin" type="number" value={form.salaryMin} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Salary/Stipend</label>
                <input name="salaryMax" type="number" value={form.salaryMax} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Duration</label>
                <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 3 months" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Application Deadline</label>
                <input name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={handleChange} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating...' : 'Update Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEdit;