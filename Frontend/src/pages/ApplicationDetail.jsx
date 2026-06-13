import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ApplicationDetailSkeleton } from "../components/Skeleton.jsx";
import GlassSelect from "../components/GlassSelect.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

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
    return <ApplicationDetailSkeleton />;
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
          className="flex items-center justify-between p-5 rounded-xl border bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              Status
            </p>
            <StatusBadge status={application.status} className="text-sm px-3 py-1" />
          </div>
          {isCompany && application.status !== "WITHDRAWN" && (
            <div className="flex gap-3 items-center">
              <span className="text-sm text-slate-500">Update Status:</span>
              <GlassSelect
                label="Update Status"
                value={application.status}
                onValueChange={(nextValue) => handleUpdateStatus(nextValue)}
                disabled={!!updating}
                placeholder="Update Status"
                clearLabel="Update Status"
                showClearOption={false}
                className="w-[220px]"
                options={[
                  { value: "APPLIED", label: "Applied" },
                  { value: "UNDER_REVIEW", label: "Under Review" },
                  { value: "SHORTLISTED", label: "Shortlisted" },
                  { value: "INTERVIEW", label: "Interview" },
                  { value: "OFFER", label: "Offer" },
                  { value: "HIRED", label: "Hired" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />
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
