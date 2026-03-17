import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const STATUS_COLORS = {
  APPLIED:      'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  UNDER_REVIEW: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  SHORTLISTED:  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  INTERVIEW:    'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  OFFER:        'bg-green-400/10 text-green-400 border-green-400/20',
  HIRED:        'bg-teal-400/10 text-teal-400 border-teal-400/20',
  REJECTED:     'bg-red-400/10    text-red-400    border-red-400/20',
  WITHDRAWN:    'bg-slate-400/10  text-slate-400  border-slate-400/20',
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompany = user?.role === 'Company';

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/applications/v1/${id}`);
      const data = await res.json();
      setApplication(data);
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(newStatus);
    const notes = newStatus === 'REJECTED' ? (window.prompt('Add a note for the applicant (optional):') ?? '') : application.recruiterNotes;
    try {
      await api.put(`/applications/v1/${id}/status`, { status: newStatus, recruiterNotes: notes });
      setApplication(prev => ({ ...prev, status: newStatus, recruiterNotes: notes || prev.recruiterNotes }));
    } catch (err) {
      alert(err.message || 'Failed to update application status');
    } finally {
      setUpdating('');
    }
  };

  const backLink = isCompany ? '/company/applications' : '/applications';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Application not found'}</p>
          <Link to={backLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const statusClass = STATUS_COLORS[application.status] || STATUS_COLORS.APPLIED;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={backLink} className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ← Back
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-medium">Application Review</span>
          </div>
          <Link
            to={isCompany ? '/dashboard/company' : '/dashboard/talent'}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className={`flex items-center justify-between p-5 rounded-xl border ${statusClass}`}>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Status</p>
            <p className="text-xl font-bold">{application.status}</p>
          </div>
          {isCompany && application.status !== 'WITHDRAWN' && (
            <div className="flex gap-3 items-center">
              <span className="text-sm text-slate-400">Update Status:</span>
              <select
                value={application.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={!!updating}
                className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="APPLIED">Applied</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {updating && <span className="text-xs text-blue-400 animate-pulse">Updating...</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Applicant</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Name</dt>
                <dd className="text-slate-200 font-medium">{application.studentName || `Candidate #${application.studentId}`}</dd>
              </div>
              {application.studentEmail && (
                <div>
                  <dt className="text-xs text-slate-400">Email</dt>
                  <dd>
                    <a href={`mailto:${application.studentEmail}`} className="text-blue-400 hover:text-blue-300">
                      {application.studentEmail}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400">Applied</dt>
                <dd className="text-slate-200">
                  {new Date(application.appliedAt || application.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Job</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Position</dt>
                <dd>
                  <Link to={`/jobs/${application.jobId}`} className="text-blue-400 hover:text-blue-300 font-medium">
                    {application.jobTitle || `Job #${application.jobId}`}
                  </Link>
                </dd>
              </div>
              {application.companyName && (
                <div>
                  <dt className="text-xs text-slate-400">Company</dt>
                  <dd className="text-slate-200">{application.companyName}</dd>
                </div>
              )}
            </dl>

            {application.resumeUrl && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-sm transition-colors"
              >
                📄 View Resume
              </a>
            )}
          </div>
        </div>
        {application.coverLetter && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Cover Letter</h2>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed text-sm">
              {application.coverLetter}
            </p>
          </div>
        )}
        {application.recruiterNotes && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-base font-semibold text-slate-200 mb-3">Recruiter Notes</h2>
            <p className="text-slate-300 text-sm italic">{application.recruiterNotes}</p>
          </div>
        )}
        {!isCompany && !['REJECTED', 'HIRED', 'WITHDRAWN'].includes(application.status) && (
          <button
            onClick={async () => {
              if (!window.confirm('Withdraw this application?')) return;
              try {
                await api.put(`/applications/v1/${id}/withdraw`, {});
                setApplication(prev => ({ ...prev, status: 'WITHDRAWN' }));
              } catch (err) {
                alert(err.message || 'Failed to withdraw');
              }
            }}
            className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
          >
            Withdraw Application
          </button>
        )}
      </div>
    </div>
  );
}
