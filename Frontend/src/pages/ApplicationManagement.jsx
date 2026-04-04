import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const ApplicationManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    if (user?.role !== 'Talent') {
      navigate('/dashboard/company');
      return;
    }
    fetchApplications();
  }, [user, page]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/applications/v1/student/${user.id}?page=${page}&size=10`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || []);
      const pages = data.totalPages ?? 1;
      setApplications(list);
      setTotalPages(pages);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!globalThis.confirm('Withdraw this application?')) return;
    setWithdrawingId(appId);
    try {
      await api.put(`/applications/v1/${appId}/withdraw`, {});
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: 'WITHDRAWN' } : a)
      );
    } catch (err) {
      alert(err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'APPLIED').length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    offer: applications.filter(a => a.status === 'OFFER').length,
    hired: applications.filter(a => a.status === 'HIRED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  let applicationsContent;
  if (loading) {
    applicationsContent = (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  } else if (applications.length === 0) {
    applicationsContent = (
      <div className="bg-slate-900 rounded-xl p-12 border border-slate-800 text-center">
        <p className="text-slate-400 mb-4">No applications yet.</p>
        <Link to="/jobs" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors">
          Browse Jobs
        </Link>
      </div>
    );
  } else {
    applicationsContent = (
      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="text-base font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {app.jobTitle || `Job #${app.jobId}`}
                  </Link>
                  <span className={`px-2 py-0.5 rounded text-xs border ${STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED}`}>
                    {app.status}
                  </span>
                </div>
                {app.companyName && (
                  <p className="text-sm text-blue-400 mb-2">{app.companyName}</p>
                )}
                <p className="text-xs text-slate-400">
                  Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                </p>
                {app.coverLetter && (
                  <p className="mt-3 text-sm text-slate-300 line-clamp-2">{app.coverLetter}</p>
                )}
                {app.recruiterNotes && (
                  <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Recruiter note:</p>
                    <p className="text-sm text-slate-300">{app.recruiterNotes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <Link
                  to={`/applications/${app.id}`}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to={`/jobs/${app.jobId}`}
                  className="px-3 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  View Job
                </Link>
                {!['REJECTED', 'HIRED', 'WITHDRAWN'].includes(app.status) && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawingId === app.id}
                    className="px-3 py-2 text-sm bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link to="/dashboard/talent" className="text-xl font-bold text-blue-400">InternNova</Link>
              <span className="text-slate-600">|</span>
              <span className="text-sm text-slate-400">My Applications</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/jobs" className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                Browse Jobs
              </Link>
              <Link to="/dashboard/talent" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Applied', value: stats.applied, color: 'text-yellow-400' },
              { label: 'Shortlisted/Interview', value: stats.shortlisted + stats.interview, color: 'text-blue-400' },
              { label: 'Hired/Offer', value: stats.hired + stats.offer, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 mb-6">
            {error}
          </div>
        )}

        {applicationsContent}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-400 text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationManagement;
