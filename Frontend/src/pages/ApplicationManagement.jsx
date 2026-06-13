import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ApplicationManagementSkeleton } from "../components/Skeleton.jsx";

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

const ApplicationManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    if (user?.role !== "Talent") {
      navigate("/dashboard/company");
      return;
    }
    fetchApplications();
  }, [user, page]);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(
        `/applications/v1/student/${user.id}?page=${page}&size=10`,
      );
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      const pages = data.totalPages ?? 1;
      setApplications(list);
      setTotalPages(pages);
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!globalThis.confirm("Withdraw this application?")) return;
    setWithdrawingId(appId);
    try {
      await api.put(`/applications/v1/${appId}/withdraw`, {});
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "WITHDRAWN" } : a)),
      );
    } catch (err) {
      alert(err.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
    offer: applications.filter((a) => a.status === "OFFER").length,
    hired: applications.filter((a) => a.status === "HIRED").length,
  };

  let applicationsContent;
  if (loading) {
    applicationsContent = (
      <ApplicationManagementSkeleton />
    );
  } else if (applications.length === 0) {
    applicationsContent = (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-500 mb-4">No applications yet.</p>
        <Link
          to="/jobs"
          className="btn-primary px-6 py-2.5 text-sm font-medium"
        >
          Browse Jobs
        </Link>
      </div>
    );
  } else {
    applicationsContent = (
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link
                    to={`/jobs/${app.jobId}`}
                    className="text-base font-semibold text-slate-900 hover:text-slate-950 transition-colors"
                  >
                    {app.jobTitle || `Job #${app.jobId}`}
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED}`}
                  >
                    {app.status}
                  </span>
                </div>
                {app.companyName && (
                  <p className="text-sm text-slate-700 mb-2">
                    {app.companyName}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  Applied{" "}
                  {new Date(
                    app.appliedAt || app.createdAt,
                  ).toLocaleDateString()}
                </p>
                {app.coverLetter && (
                  <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                    {app.coverLetter}
                  </p>
                )}
                {app.recruiterNotes && (
                  <div className="mt-3 p-3 bg-white/60 rounded-lg border border-white/50">
                    <p className="text-xs text-slate-500 mb-1">
                      Recruiter note:
                    </p>
                    <p className="text-sm text-slate-600">
                      {app.recruiterNotes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <Link
                  to={`/applications/${app.id}`}
                  className="btn-primary px-3 py-2 text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  to={`/jobs/${app.jobId}`}
                  className="btn-secondary px-3 py-2 text-sm"
                >
                  View Job
                </Link>
                {!["REJECTED", "HIRED", "WITHDRAWN"].includes(app.status) && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawingId === app.id}
                    className="px-3 py-2 text-sm bg-transparent text-rose-600 border border-rose-300 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 font-medium"
                  >
                    {withdrawingId === app.id ? "Withdrawing..." : "Withdraw"}
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        My Applications
      </h1>

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-slate-900" },
            { label: "Applied", value: stats.applied, color: "text-amber-600" },
            {
              label: "Shortlisted/Interview",
              value: stats.shortlisted + stats.interview,
              color: "text-blue-600",
            },
            {
              label: "Hired/Offer",
              value: stats.hired + stats.offer,
              color: "text-emerald-600",
            },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 mb-6">
          {error}
        </div>
      )}

      {applicationsContent}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-500 text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement;
