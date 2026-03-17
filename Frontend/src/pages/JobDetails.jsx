import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import JobApplicationForm from '../components/JobApplicationForm';

function formatSalary(min, max) {
  if (!min && !max) return 'Not specified';
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isCompany = user?.role === 'Company';
  const isTalent = user?.role === 'Talent';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id, user?.id]);

  const fetchJob = async () => {
    setLoading(true);
    setError('');
    try {
      const url = user?.id ? `/jobs/v1/${id}?viewerId=${user.id}` : `/jobs/v1/${id}`;
      const res = await api.get(url);
      const jobData = await res.json();
      setJob(jobData);

      // Check if talent already applied
      if (isTalent && user) {
        try {
          const appsRes = await api.get(`/applications/v1/student/${user.id}?page=-1&size=-1`);
          const apps = await appsRes.json();
          const list = Array.isArray(apps) ? apps : (apps.content || []);
          setHasApplied(list.some(a => String(a.jobId) === String(id)));

          const profileRes = await api.get(`/talent/v1/${user.id}`);
          const profile = await profileRes.json();
          if (profile.savedJobs && profile.savedJobs.includes(id)) {
            setIsSaved(true);
          }
        } catch {
          // non-critical
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      const payloadData = {
        jobId: id,
        studentId: user?.id,
        coverLetter: applicationData.get('coverLetter'),
        resumeUrl: applicationData.get('resumeUrl') || undefined,
      };
      const formData = new FormData();
      formData.append('data', JSON.stringify(payloadData));

      const resumeFile = applicationData.get('resumeFile');
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }

      await api.post('/applications/v1', formData);

      setHasApplied(true);
      setApplySuccess(true);
      setShowApplicationForm(false);
    } catch (err) {
      alert(err.message || 'Failed to submit application. Please try again.');
    }
  };

  const handleToggleSave = async () => {
    if (!user || user.role !== 'Talent') return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/talent/v1/${user.id}/saved-jobs/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/talent/v1/${user.id}/saved-jobs/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to update saved jobs list.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Job not found'}</p>
          <Link to="/jobs" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onSubmit={handleApplicationSubmit}
          onCancel={() => setShowApplicationForm(false)}
        />
      )}
      <div className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/jobs" className="text-xl font-bold text-blue-400">InternNova</Link>
              <span className="text-slate-600">|</span>
              <Link to="/jobs" className="text-sm text-slate-400 hover:text-slate-300">Browse Jobs</Link>
            </div>
            {user && (
              <Link
                to={isCompany ? '/dashboard/company' : '/dashboard/talent'}
                className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applySuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
            Application submitted successfully! Track its status in{' '}
            <Link to="/applications" className="underline">My Applications</Link>.
          </div>
        )}
        <div className="bg-slate-900 rounded-xl p-8 mb-6 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                {job.remoteOption && (
                  <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded text-xs">Remote</span>
                )}
                {job.jobType && (
                  <span className="px-2 py-1 bg-blue-400/10 text-blue-400 rounded text-xs">
                    {job.jobType.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 mb-4">
                <span>{job.location}</span>
                {job.duration && <><span className="text-slate-600">•</span><span>{job.duration}</span></>}
                <span className="text-slate-600">•</span>
                <span className="text-green-400 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</span>
              </div>
              {(job.startDate || job.applicationDeadline) && (
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {job.startDate && <span>Start: {new Date(job.startDate).toLocaleDateString()}</span>}
                  {job.applicationDeadline && (
                    <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              {isTalent && (
                hasApplied ? (
                  <div className="px-6 py-3 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg font-medium">
                    Applied ✓
                  </div>
                ) : job.status === 'CLOSED' || job.status === 'ARCHIVED' ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-slate-700 text-slate-400 rounded-lg font-medium cursor-not-allowed"
                  >
                    This job is no longer accepting applications.
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleSave}
                      disabled={saveLoading}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors border flex items-center justify-center ${
                        isSaved
                          ? 'bg-blue-600/20 text-blue-400 border-blue-600/30 hover:bg-blue-600/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title={isSaved ? "Remove from saved jobs" : "Save this job for later"}
                    >
                      {saveLoading ? '...' : (isSaved ? '★ Saved' : '☆ Save')}
                    </button>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                )
              )}
              {isCompany && user.id === job.companyId && (
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Job
                </Link>
              )}
              {isCompany && (
                <Link
                  to={`/jobs/${job.id}/applications`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Applications
                </Link>
              )}
              {!user && (
                <Link
                  to="/login"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign In to Apply
                </Link>
              )}
              <div className="text-right text-xs text-slate-500">
                <p>{job.applicationsCount || 0} applicants</p>
                <p>{job.viewsCount || 0} views</p>
              </div>
            </div>
          </div>
          {job.skillsRequired?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wide">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/15 text-blue-300 rounded-md text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {job.description && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}
            {job.responsibilities && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4">Responsibilities</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
              </div>
            )}
            {job.requirements && (
              <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-lg font-semibold mb-4">Requirements</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h3 className="text-base font-semibold mb-4">Job Overview</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-400">Job Type</dt>
                  <dd className="text-slate-200">{job.jobType?.replace('_', ' ') || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Location</dt>
                  <dd className="text-slate-200">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Work Style</dt>
                  <dd className="text-slate-200">{job.remoteOption ? 'Remote / Hybrid' : 'On-site'}</dd>
                </div>
                {job.duration && (
                  <div>
                    <dt className="text-xs text-slate-400">Duration</dt>
                    <dd className="text-slate-200">{job.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-slate-400">Salary</dt>
                  <dd className="text-green-400">{formatSalary(job.salaryMin, job.salaryMax)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Applications</dt>
                  <dd className="text-slate-200">{job.applicationsCount || 0}</dd>
                </div>
              </dl>
            </div>

            {isTalent && !hasApplied && job.status === 'ACTIVE' && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Apply for this Job
              </button>
            )}
            {isTalent && !hasApplied && (job.status === 'CLOSED' || job.status === 'ARCHIVED') && (
              <button
                disabled
                className="w-full py-3 bg-slate-700 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
              >
                This job is no longer accepting applications.
              </button>
            )}
            
            {isTalent && job.status === 'ACTIVE' && (
              <button
                onClick={handleToggleSave}
                disabled={saveLoading}
                className={`w-full py-3 mt-3 rounded-xl font-semibold transition-colors border ${
                  isSaved
                    ? 'bg-blue-600/10 text-blue-400 border-blue-600/30 hover:bg-blue-600/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {saveLoading ? 'Loading...' : (isSaved ? 'Remove from Saved Jobs' : 'Save Job for Later')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
