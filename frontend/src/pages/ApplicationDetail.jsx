import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ApplicationDetailSkeleton } from "../components/Skeleton.jsx";
import GlassSelect from "../components/GlassSelect.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAlert } from "../lib/AlertContext.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import Seo from "../components/Seo.jsx";

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompany = user?.role === "Company";
  const { showAlert, showConfirm, showPrompt } = useAlert();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    setLoading(true);
    setError("");
    try {
      const forStudentParam = isCompany ? "" : "?forStudent=true";
      const res = await api.get(`/applications/v1/${id}${forStudentParam}`);
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
        ? ((await showPrompt("Add a note for the applicant (optional):")) ?? "")
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
      errorHandler.success(`Status updated to ${newStatus.replace("_", " ")} successfully!`);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to update application status" });
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
      <Seo title="InternNova | Application Details" description="View detailed application status, feedback, and next steps." path="/applications" />
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
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />
              {updating && (
                <span className="inline-flex items-center text-xs text-slate-700">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />
                  Updating...
                </span>
              )}
            </div>
          )}
        </div>

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

        {application.motivationStatement && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Why {application.applicantName || "they"} want to join{" "}
              {application.companyName || "this company"}
            </h2>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">
              {application.motivationStatement}
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
                const confirmed = await showConfirm("Withdraw this application?", { type: "warning" });
                if (!confirmed) return;
                setWithdrawing(true);
                try {
                  await api.put(`/applications/v1/${id}/withdraw`, {});
                  setApplication((prev) => ({ ...prev, status: "WITHDRAWN" }));
                  errorHandler.success("Application withdrawn successfully!");
                } catch (err) {
                  errorHandler.handle(err, { fallbackMessage: "Failed to withdraw" });
                } finally {
                  setWithdrawing(false);
                }
              }}
              disabled={withdrawing}
              className="px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {withdrawing ? (
                <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Withdrawing...</>
              ) : "Withdraw Application"}
            </button>
          )}
      </div>
    </div>
  );
}
