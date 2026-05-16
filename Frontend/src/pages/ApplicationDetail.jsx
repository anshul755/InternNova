import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";

const STATUS_COLORS = {
  APPLIED: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SHORTLISTED: "bg-lime-50 text-lime-700 border-lime-200",
  INTERVIEW: "bg-teal-50 text-teal-700 border-teal-200",
  OFFER: "bg-green-50 text-green-700 border-green-200",
  HIRED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  WITHDRAWN: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompany = user?.role === "Company";

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/applications/v1/${id}`);
      const data = await res.json();
      setApplication(data);
    } catch (err) {
      setError(err.message || "Failed to load application");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(newStatus);
    const notes =
      newStatus === "REJECTED"
        ? (window.prompt("Add a note for the applicant (optional):") ?? "")
        : application.recruiterNotes;
    try {
      await api.put(`/applications/v1/${id}/status`, {
        status: newStatus,
        recruiterNotes: notes,
      });
      setApplication((prev) => ({
        ...prev,
        status: newStatus,
        recruiterNotes: notes || prev.recruiterNotes,
      }));
    } catch (err) {
      alert(err.message || "Failed to update application status");
    } finally {
      setUpdating("");
    }
  };

  const backLink = isCompany ? "/company/applications" : "/applications";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-rose-500 mb-4">
            {error || "Application not found"}
          </p>
          <Link
            to={backLink}
            className="btn-primary px-4 py-2 text-sm font-medium"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const statusClass =
    STATUS_COLORS[application.status] || STATUS_COLORS.APPLIED;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to={backLink}
            className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
          >
            ← Back
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-900">
            Application Review
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Banner */}
        <div
          className={`flex items-center justify-between p-5 rounded-xl border ${statusClass}`}
        >
          <div>
            <p className="text-xs uppercase tracking-wide opacity-70 mb-1">
              Status
            </p>
            <p className="text-xl font-bold">{application.status}</p>
          </div>
          {isCompany && application.status !== "WITHDRAWN" && (
            <div className="flex gap-3 items-center">
              <span className="text-sm text-slate-500">Update Status:</span>
              <select
                value={application.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                disabled={!!updating}
                className="bg-white/60 border border-white/60 text-slate-900 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none disabled:opacity-50"
              >
                <option value="APPLIED">Applied</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="HIRED">Hired</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {updating && (
                <span className="text-xs text-slate-700 animate-pulse">
                  Updating...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              Applicant
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Name</dt>
                <dd className="text-slate-700 font-medium">
                  {application.studentName ||
                    `Candidate #${application.studentId}`}
                </dd>
              </div>
              {application.studentEmail && (
                <div>
                  <dt className="text-xs text-slate-400">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${application.studentEmail}`}
                      className="text-slate-700 hover:text-slate-900"
                    >
                      {application.studentEmail}
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-400">Applied</dt>
                <dd className="text-slate-700">
                  {new Date(
                    application.appliedAt || application.createdAt,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Job</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Position</dt>
                <dd>
                  <Link
                    to={`/jobs/${application.jobId}`}
                    className="text-slate-700 hover:text-slate-900 font-medium"
                  >
                    {application.jobTitle || `Job #${application.jobId}`}
                  </Link>
                </dd>
              </div>
              {application.companyName && (
                <div>
                  <dt className="text-xs text-slate-400">Company</dt>
                  <dd className="text-slate-700">{application.companyName}</dd>
                </div>
              )}
            </dl>

            {application.resumeUrl && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-brand-100 hover:bg-brand-200 border border-brand-200 text-slate-900 rounded-lg text-sm font-medium transition-colors"
              >
                View Resume
              </a>
            )}
          </div>
        </div>

        {application.coverLetter && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Cover Letter
            </h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
              {application.coverLetter}
            </p>
          </div>
        )}
        {application.recruiterNotes && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              Recruiter Notes
            </h2>
            <p className="text-slate-600 text-sm italic">
              {application.recruiterNotes}
            </p>
          </div>
        )}
        {!isCompany &&
          !["REJECTED", "HIRED", "WITHDRAWN"].includes(application.status) && (
            <button
              onClick={async () => {
                if (!window.confirm("Withdraw this application?")) return;
                try {
                  await api.put(`/applications/v1/${id}/withdraw`, {});
                  setApplication((prev) => ({ ...prev, status: "WITHDRAWN" }));
                } catch (err) {
                  alert(err.message || "Failed to withdraw");
                }
              }}
              className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium transition-colors"
            >
              Withdraw Application
            </button>
          )}
      </div>
    </div>
  );
}
