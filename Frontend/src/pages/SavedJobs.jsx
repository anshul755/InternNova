import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const formatSalary = (min, max) => {
  if (!min && !max) return '';
  if (min && max) return `₹${min.toLocaleString('en-IN')} – ₹${max.toLocaleString('en-IN')}`;
  if (min) return `From ₹${min.toLocaleString('en-IN')}`;
  return `Up to ₹${max.toLocaleString('en-IN')}`;
};

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSavedJobs = useCallback(async () => {
    if (!user || user.role !== 'Talent') return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/talent/v1/${user.id}/saved-jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const removeSavedJob = async (jobId) => {
    try {
      await api.delete(`/talent/v1/${user.id}/saved-jobs/${jobId}`);
      setJobs(currentJobs => currentJobs.filter(job => job.id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to remove saved job.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Jobs</h1>
          <p className="text-slate-400 mt-1">
            Review and apply to jobs you've bookmarked for later.
          </p>
        </div>
        <Link 
          to="/jobs" 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
        >
          Browse More Jobs
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
          <button onClick={fetchSavedJobs} className="ml-3 text-red-300 hover:text-red-200 underline text-sm">
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800">
          <div className="text-4xl mb-4">🔖</div>
          <h2 className="text-xl font-medium text-white mb-2">No saved jobs yet</h2>
          <p className="text-slate-400 mb-6">
            Jobs you save will appear here for easy access.
          </p>
          <Link 
            to="/jobs" 
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block"
          >
            Find jobs to save
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.status === 'CLOSED' || job.status === 'ARCHIVED' ? (
                      <span className="px-2 py-0.5 bg-red-400/10 text-red-400 rounded text-xs">No longer accepting applications</span>
                    ) : (
                      <>
                        {job.remoteOption && (
                          <span className="px-2 py-0.5 bg-green-400/10 text-green-400 rounded text-xs">Remote</span>
                        )}
                        {job.jobType && (
                          <span className="px-2 py-0.5 bg-blue-400/10 text-blue-400 rounded text-xs">
                            {job.jobType.replace('_', ' ')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
                    <span className="text-slate-300">{job.location}</span>
                    {job.duration && <><span className="text-slate-600">•</span><span>{job.duration}</span></>}
                    {(job.salaryMin || job.salaryMax) && (
                      <><span className="text-slate-600">•</span><span className="text-green-400">{formatSalary(job.salaryMin, job.salaryMax)}</span></>
                    )}
                  </div>

                  {job.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skillsRequired.slice(0, 4).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded text-xs">{skill}</span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                          +{job.skillsRequired.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeSavedJob(job.id)}
                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
