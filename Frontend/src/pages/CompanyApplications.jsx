import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const STATUS_COLORS = {
  APPLIED:      'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  UNDER_REVIEW: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  SHORTLISTED:  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  INTERVIEW:    'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  OFFER:        'bg-green-400/10 text-green-400 border-green-400/20',
  HIRED:        'bg-teal-400/10 text-teal-400 border-teal-400/20',
  REJECTED:     'bg-red-400/10 text-red-400 border-red-400/20',
  WITHDRAWN:    'bg-slate-400/10 text-slate-400 border-slate-400/20',
};

export default function CompanyApplications() {
  const { user } = useAuth();
  const { id: routeJobId } = useParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(routeJobId || '');
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    loadJobs();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedJobId) return;
    loadApplications();
  }, [selectedJobId, page]);

  async function loadJobs() {
    setLoadingJobs(true);
    setError('');
    try {
      const res = await api.get(`/jobs/v1/company/${user.id}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setJobs(list);

      if (list.length === 0) {
        setSelectedJobId('');
        return;
      }

      if (routeJobId && list.some((job) => String(job.id) === String(routeJobId))) {
        setSelectedJobId(String(routeJobId));
      } else {
        setSelectedJobId((prev) => prev || String(list[0].id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoadingJobs(false);
    }
  }

  async function loadApplications() {
    setLoadingApps(true);
    setError('');
    try {
      const res = await api.get(`/applications/v1/job/${selectedJobId}?page=-1&size=-1`);
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : data.content || []);
      setTotalPages(1);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  }

  async function updateStatus(applicationId, newStatus) {
    setUpdatingId(applicationId);
    try {
      await api.put(`/applications/v1/${applicationId}/status`, { status: newStatus, recruiterNotes: '' });
      setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status: newStatus } : a)));
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    } finally {
      setUpdatingId('');
    }
  }

  const selectedJob = jobs.find((job) => String(job.id) === String(selectedJobId));

  let jobsContent;
  if (loadingJobs) {
    jobsContent = (
      <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>
    );
  } else if (jobs.length === 0) {
    jobsContent = (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
        <p className="text-slate-400 mb-4">No jobs posted yet.</p>
        <Link to="/jobs/create" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Post your first job</Link>
      </div>
    );
  } else {
    let applicationsContent;
    if (loadingApps) {
      applicationsContent = (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>
      );
    } else if (applications.length === 0) {
      applicationsContent = (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
          No applications for this job yet.
        </div>
      );
    } else {
      const pipelineStages = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];
      
      applicationsContent = (
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
          {pipelineStages.map((stage) => {
            const appsInStage = applications.filter((a) => a.status === stage);
            return (
              <div key={stage} className="bg-slate-900 border border-slate-800 rounded-xl min-w-[300px] flex flex-col flex-1 shrink-0 snap-start">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
                  <span className="font-semibold text-sm text-slate-200">{stage.replace('_', ' ')}</span>
                  <span className="px-2 py-0.5 bg-slate-700 rounded-full text-xs text-slate-300">{appsInStage.length}</span>
                </div>
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
                  {appsInStage.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 italic">No candidates</div>
                  ) : (
                    appsInStage.map((app) => (
                      <div key={app.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm relative group">
                        <Link to={`/applications/${app.id}`} className="block">
                          <h3 className="font-semibold text-sm text-white hover:text-blue-400 truncate pr-6">{app.studentName || `Candidate #${app.studentId}`}</h3>
                          <p className="text-xs text-slate-400 mt-1">Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}</p>
                        </Link>
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300">
                            📄 Resume
                          </a>
                        )}
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          disabled={updatingId === app.id}
                          className="mt-3 w-full bg-slate-950 border border-slate-600 rounded text-xs px-2 py-1 text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-50"
                        >
                          {pipelineStages.map(s => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    jobsContent = (
      <>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <label htmlFor="job-select" className="text-xs text-slate-400 block mb-2">Select Job</label>
          <select
            id="job-select"
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setPage(0);
            }}
            className="w-full sm:w-[420px] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title} • {job.location}</option>
            ))}
          </select>
        </div>

        {selectedJob && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold">{selectedJob.title}</h2>
            <p className="text-slate-400 text-sm mt-1">{selectedJob.location} • {selectedJob.jobType?.replace('_', ' ') || '—'}</p>
          </div>
        )}

        {applicationsContent}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard/company" className="text-xl font-bold text-blue-400">InternNova</Link>
            <span className="text-slate-600">|</span>
            <span className="text-sm text-slate-400">Job Applications</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/jobs/create" className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg">Post Job</Link>
            <Link to="/dashboard/company" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg">Dashboard</Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">Manage Applications</h1>

        {error && <div className="mb-6 p-4 rounded-lg border border-red-500/30 text-red-400 bg-red-500/10">{error}</div>}

        {jobsContent}
      </div>
    </div>
  );
}
