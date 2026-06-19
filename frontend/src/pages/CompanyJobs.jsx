import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { CompanyJobsSkeleton } from "../components/Skeleton.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import {
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoArchiveOutline,
  IoPlayOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
  IoFilterOutline,
  IoAddOutline,
  IoChevronForwardOutline,
  IoMegaphoneOutline,
} from "react-icons/io5";
import { useAlert } from "../lib/AlertContext.jsx";
import { errorHandler } from "../lib/errorHandler.js";
import Seo from "../components/Seo.jsx";

const JOB_FILTERS = ["ALL", "DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"];

export default function CompanyJobs() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [mutation, setMutation] = useState(null); // { jobId, action } | null
  const { showAlert, showConfirm } = useAlert();

  useEffect(() => {
    if (user?.id) fetchJobs();
  }, [user?.id]);

  async function fetchJobs() {
    setLoading(true);
    setError("");

    try {
      const [companyRes, jobsRes] = await Promise.all([
        api
          .get(`/company/v1/${user.id}`)
          .then((res) => res.json())
          .catch(() => null),
        api
          .get(`/jobs/v1/company/${user.id}`)
          .then((res) => res.json())
          .catch(() => []),
      ]);

      setCompany(companyRes);
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes.content || []);
    } catch (err) {
      setError(err.message || "Failed to load your jobs");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteJob(jobId) {
    const confirmed = await showConfirm("Are you sure you want to delete this job posting?", { type: "danger" });
    if (!confirmed) return;
    setMutation({ jobId, action: "delete" });
    try {
      await api.delete(`/jobs/v1/${jobId}`);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      errorHandler.success("Job deleted successfully!");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to delete job" });
    } finally {
      setMutation(null);
    }
  }

  async function handleUpdateJobStatus(jobId, newStatus) {
    const statusType = newStatus === "ACTIVE" ? "success" : newStatus === "CLOSED" ? "warning" : newStatus === "ARCHIVED" ? "warning" : "info";
    const confirmed = await showConfirm(
      `Are you sure you want to change this job's status to ${newStatus}?`,
      { type: statusType },
    );
    if (!confirmed) return;
    setMutation({ jobId, action: newStatus });
    try {
      const res = await api.put(`/jobs/v1/${jobId}`, { status: newStatus });
      const updatedJob = await res.json();
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? updatedJob : job)),
      );
      errorHandler.success(`Job status updated to ${newStatus.replace("_", " ")} successfully!`);
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: `Failed to update job status to ${newStatus}` });
    } finally {
      setMutation(null);
    }
  }

  async function handlePublishResults(jobId) {
    const confirmed = await showConfirm(
      "Are you sure you want to publish results? This will notify candidates of their final status. This action cannot be undone.",
      { type: "info" }
    );
    if (!confirmed) return;
    setMutation({ jobId, action: "publish" });
    try {
      const res = await api.post(`/jobs/v1/${jobId}/publish-results`);
      const updatedJob = await res.json();
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? updatedJob : job)),
      );
      errorHandler.success("Job results published successfully!");
    } catch (err) {
      errorHandler.handle(err, { fallbackMessage: "Failed to publish results" });
    } finally {
      setMutation(null);
    }
  }

  const stats = useMemo(() => {
    return {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((job) => job.status === "ACTIVE").length,
      closedJobs: jobs.filter((job) => job.status === "CLOSED").length,
      totalApplications: jobs.reduce(
        (sum, job) => sum + (job.applicationsCount || 0),
        0,
      ),
    };
  }, [jobs]);




  const filteredJobs = jobs.filter(
    (job) => jobFilter === "ALL" || job.status === jobFilter,
  );

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Seo title="InternNova | My Jobs" description="View and manage all your company job postings." path="/company/jobs" />
        <CompanyJobsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card max-w-2xl mx-auto p-6 text-center">
          <p className="text-rose-500 mb-4">{error}</p>
          <button onClick={fetchJobs} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | My Jobs" description="View and manage all your company job postings." path="/company/jobs" />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
            Company Workspace
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
            My Jobs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
            Review every job you have posted, track status, and manage active
            listings from one focused workspace.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/jobs/create"
            className="btn-primary inline-flex items-center gap-2"
          >
            <IoAddOutline className="w-4 h-4" />
            Post New Job
          </Link>
          <Link
            to="/company/applications"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <IoDocumentTextOutline className="w-4 h-4" />
            View Applications
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Jobs",
            value: stats.totalJobs,
            icon: IoBriefcaseOutline,
            color: "text-emerald-700 dark:text-emerald-400",
            iconBg: "bg-emerald-100/80 dark:bg-emerald-500/10",
          },
          {
            label: "Active Jobs",
            value: stats.activeJobs,
            icon: IoPlayOutline,
            color: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-100/80 dark:bg-emerald-500/10",
          },
          {
            label: "Closed Jobs",
            value: stats.closedJobs,
            icon: IoCloseCircleOutline,
            color: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-100/80 dark:bg-amber-500/10",
          },
          {
            label: "Total Applications",
            value: stats.totalApplications,
            icon: IoDocumentTextOutline,
            color: "text-lime-700 dark:text-lime-400",
            iconBg: "bg-lime-100/80 dark:bg-lime-500/10",
          },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="glass-card p-5 border border-white/50 dark:border-white/5 bg-white/60 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                {label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="glass-card card-scroll-shell p-6 xl:h-[calc(100vh-14rem)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
                <IoFilterOutline className="w-4 h-4" />
                Filters
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                All posted jobs
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {company?.companyName || "Your company"} job archive
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {JOB_FILTERS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setJobFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                    jobFilter === tab
                      ? "bg-white/95 text-slate-900 border-white/90 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                      : "bg-white/30 text-slate-600 border-white/40 hover:bg-white/50 dark:bg-white/5 dark:text-slate-400 dark:border-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="card-scroll-region space-y-4 xl:flex-1">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="bg-white/65 dark:bg-white/[0.02] rounded-3xl border border-white/70 dark:border-white/[0.06] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)] hover:border-emerald-500/20 dark:hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {job.title}
                        </h2>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{job.location}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400 mt-4">
                        <span className="inline-flex items-center gap-1.5">
                          <IoDocumentTextOutline className="w-3.5 h-3.5 text-emerald-500" />
                          {job.applicationsCount || 0} applications
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <IoEyeOutline className="w-3.5 h-3.5 text-emerald-500" />
                          {job.viewsCount || 0} views
                        </span>
                        <span>
                          Posted{" "}
                          {new Date(
                            job.createdAt || job.postedAt || Date.now(),
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto gap-2.5 justify-center sm:justify-end mt-2 sm:mt-0">
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-all shadow-sm"
                      >
                        <IoDocumentTextOutline className="w-4 h-4" />
                        Applications
                      </Link>
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/70 text-slate-700 text-sm font-medium hover:bg-white dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 transition-all shadow-sm"
                      >
                        <IoCreateOutline className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-5 pt-4 border-t border-white/50 dark:border-white/[0.06]">
                    {new Date(job.applicationDeadline) < new Date() && !job.resultsPublished && job.status !== "DRAFT" && (
                      <button
                        onClick={() => handlePublishResults(job.id)}
                        disabled={mutation?.jobId === job.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed sm:mr-auto"
                      >
                        <IoMegaphoneOutline className="w-4 h-4" />
                        {mutation?.jobId === job.id && mutation?.action === "publish" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Publishing...</>
                        ) : "Publish Results"}
                      </button>
                    )}

                    {job.status === "ACTIVE" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "CLOSED")}
                        disabled={mutation?.jobId === job.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <IoCloseCircleOutline className="w-4 h-4" />
                        {mutation?.jobId === job.id && mutation?.action === "CLOSED" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Closing...</>
                        ) : "Close"}
                      </button>
                    )}
                    {job.status === "DRAFT" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "ACTIVE")}
                        disabled={mutation?.jobId === job.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <IoPlayOutline className="w-4 h-4" />
                        {mutation?.jobId === job.id && mutation?.action === "ACTIVE" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Publishing...</>
                        ) : "Publish"}
                      </button>
                    )}
                    {job.status === "CLOSED" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "ARCHIVED")
                          }
                          disabled={mutation?.jobId === job.id}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-white/5 dark:hover:bg-white/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <IoArchiveOutline className="w-4 h-4" />
                          {mutation?.jobId === job.id && mutation?.action === "ARCHIVED" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />Archiving...</>
                          ) : "Archive"}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "ACTIVE")
                          }
                          disabled={mutation?.jobId === job.id}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <IoRefreshOutline className="w-4 h-4" />
                          {mutation?.jobId === job.id && mutation?.action === "ACTIVE" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />Reopening...</>
                          ) : "Reopen"}
                        </button>
                      </>
                    )}
                    {job.status === "ARCHIVED" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "ACTIVE")
                          }
                          disabled={mutation?.jobId === job.id}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <IoRefreshOutline className="w-4 h-4" />
                          {mutation?.jobId === job.id && mutation?.action === "ACTIVE" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />Reopening...</>
                          ) : "Reopen"}
                        </button>
                        {(!job.applicationsCount ||
                          job.applicationsCount === 0) && (
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={mutation?.jobId === job.id}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <IoTrashOutline className="w-4 h-4" />
                            {mutation?.jobId === job.id && mutation?.action === "delete" ? (
                              <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1" />Deleting...</>
                            ) : "Delete"}
                          </button>
                        )}
                      </>
                    )}
                    {job.status === "ACTIVE" &&
                      (!job.applicationsCount ||
                        job.applicationsCount === 0) && (
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          <IoTrashOutline className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white/65 rounded-3xl border border-white/70 p-10 text-center">
              <IoBriefcaseOutline className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">
                No jobs in this view
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Start by posting a new job, or switch the filter to see a
                different set of your postings.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Link
                  to="/jobs/create"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <IoAddOutline className="w-4 h-4" />
                  Post New Job
                </Link>
                <button
                  onClick={() => setJobFilter("ALL")}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <IoFilterOutline className="w-4 h-4" />
                  Clear filter
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 space-y-0">
          <div className="glass-card p-6 border border-white/50 dark:border-white/5 bg-white/60 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Company Snapshot
              </h2>
            </div>
            {company ? (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Company Name
                  </p>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">
                    {company.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Industry
                  </p>
                  <p className="text-slate-800 dark:text-slate-200">
                    {company.companyType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Size
                  </p>
                  <p className="text-slate-800 dark:text-slate-200">
                    {company.companySize} employees
                  </p>
                </div>
                {company.websiteUrl && (
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Website
                    </p>
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white break-all underline underline-offset-2"
                    >
                      {company.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Complete your company profile to make your jobs page more
                polished.
              </p>
            )}
          </div>

          <div className="glass-card p-6 border border-white/50 dark:border-white/5 bg-white/60 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <Link
                to="/jobs/create"
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-100/50 text-sm font-medium text-emerald-900 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10 dark:border-emerald-500/10 dark:text-emerald-400 transition-colors shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <IoAddOutline className="w-4 h-4" />
                  Post New Job
                </span>
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
              <Link
                to="/company/applications"
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/70 hover:bg-white/90 border border-white/60 text-sm font-medium text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:text-slate-300 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <IoDocumentTextOutline className="w-4 h-4" />
                  Review Applications
                </span>
                <IoChevronForwardOutline className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
