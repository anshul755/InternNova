import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { ApplicationManagementSkeleton } from "../components/Skeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAlert } from "../lib/AlertContext.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import { IoSearchOutline, IoCloseCircle, IoChevronDown } from "react-icons/io5";
import Seo from "../components/Seo.jsx";

const ApplicationManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    const handler = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
      <Seo title="InternNova | My Applications" description="Track and manage all your submitted job applications." path="/applications" />

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
    const confirmed = await showConfirm("Withdraw this application?", { type: "warning" });
    if (!confirmed) return;
    setWithdrawingId(appId);
    try {
      await api.put(`/applications/v1/${appId}/withdraw`, {});
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: "WITHDRAWN" } : a)),
      );
      errorHandler.success("Application withdrawn successfully!");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to withdraw application" });
    } finally {
      setWithdrawingId(null);
    }
  };

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
    interview: applications.filter((a) => a.status === "INTERVIEW").length,
  };

  const statusOptions = ["ALL", "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED"];

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (app.jobTitle || "").toLowerCase().includes(q) ||
        (app.companyName || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "ALL";

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
  } else if (filteredApplications.length === 0) {
    applicationsContent = (
      <div className="glass-card p-12 text-center">
        <IoSearchOutline className="mx-auto h-10 w-10 opacity-30 mb-4" />
        <p className="text-slate-500 mb-1 font-semibold">No matching applications</p>
        <p className="text-sm text-slate-400 mb-4">Try adjusting your search or filter.</p>
        <button
          onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
          className="btn-secondary px-5 py-2 text-sm font-medium"
        >
          Clear filters
        </button>
      </div>
    );
  } else {
    applicationsContent = (
      <div className="space-y-4">
        {filteredApplications.map((app) => (
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
                  <StatusBadge status={app.status} />
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
                {app.motivationStatement && (
                  <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                    {app.motivationStatement}
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | My Applications" description="Track and manage all your submitted job applications." path="/applications" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          My Applications
        </h1>
        {!loading && applications.length > 0 && hasActiveFilters && (
          <p className="text-sm text-slate-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        )}
      </div>

      {!loading && applications.length > 0 && (
        <div className="relative z-20">
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center overflow-visible">
          <div className="relative flex-1">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="application-search"
              type="text"
              placeholder="Search by job title or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Clear search"
              >
                <IoCloseCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative z-[60]" ref={statusDropdownRef}>
            <button
              id="application-status-filter"
              onClick={() => setStatusDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all cursor-pointer min-w-[160px]"
              aria-expanded={statusDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="flex-1 text-left truncate">
                {statusFilter === "ALL"
                  ? "Status"
                  : statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase().replace("_", " ")}
              </span>
              <IoChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`absolute right-0 sm:left-0 top-full mt-2 w-52 glass-panel border border-white/60 dark:border-white/10 py-1.5 overflow-hidden z-[70] origin-top transition-all duration-200 ease-out will-change-transform ${
                statusDropdownOpen
                  ? "pointer-events-auto visible opacity-100 translate-y-0 scale-100"
                  : "pointer-events-none invisible opacity-0 -translate-y-2 scale-95"
              }`}
              role="listbox"
              aria-label="Filter by status"
            >
              {statusOptions.map((s) => {
                const label =
                  s === "ALL"
                    ? "Status"
                    : s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ");
                const isSelected = statusFilter === s;
                return (
                  <button
                    key={s}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusDropdownOpen(false);
                    }}
                    className={`flex items-center w-[calc(100%-0.5rem)] px-3 py-2.5 mx-1 my-0.5 rounded-lg text-sm transition-all duration-300 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-[0_0_14px_rgba(124,200,74,0.3)] dark:hover:shadow-[0_0_16px_rgba(159,232,112,0.2)] ${isSelected ? "font-semibold" : ""}`}
                  >
                    {isSelected && (
                      <span className="mr-2 text-emerald-500">✓</span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}
              className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-slate-900" },
            { label: "Applied", value: stats.applied, color: "text-amber-600" },
            {
              label: "Shortlisted/Interview",
              value: stats.shortlisted + stats.interview,
              color: "text-blue-600",
            },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchApplications} />}

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
