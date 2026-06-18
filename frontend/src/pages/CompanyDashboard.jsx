import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { resolveLogoUrl } from "../lib/media.js";
import { CompanyDashboardSkeleton } from "../components/Skeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Seo from "../components/Seo.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAlert } from "../lib/AlertContext.jsx";
import {
  IoAddOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoCreateOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoFlashOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoMegaphoneOutline,
} from "react-icons/io5";

const JOB_FILTERS = ["ALL", "ACTIVE", "DRAFT", "CLOSED", "ARCHIVED"];



const CompanyDashboard = () => {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useAlert();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobFilter, setJobFilter] = useState("ALL");
  const [imgError, setImgError] = useState(false);
  const [mutation, setMutation] = useState(null); // { jobId, action } | null

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const companyPromise = api
        .get(`/company/v1/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          if (String(err?.message || "").includes("404")) return null;
          throw err;
        });

      const jobsPromise = api
        .get(`/jobs/v1/company/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          if (String(err?.message || "").includes("404")) return [];
          throw err;
        });

      const [companyData, jobsData] = await Promise.all([
        companyPromise,
        jobsPromise,
      ]);

      setCompany(companyData);
      const jobList = Array.isArray(jobsData)
        ? jobsData
        : jobsData.content || [];
      setJobs(jobList);

      if (jobList.length > 0) {
        try {
          const appsRes = await api.get(
            `/applications/v1/job/${jobList[0].id}?page=0&size=5&sortBy=appliedAt&sortDir=desc`,
          );
          const appsData = await appsRes.json();
          setRecentApplications(
            Array.isArray(appsData) ? appsData : appsData.content || [],
          );
        } catch {
          setRecentApplications([]);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = await showConfirm("Are you sure you want to delete this job posting?", { type: "danger" });
    if (!confirmed) return;
    setMutation({ jobId, action: "delete" });
    try {
      await api.delete(`/jobs/v1/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      await showAlert(err.message || "Failed to delete job");
    } finally {
      setMutation(null);
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
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
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    } catch (err) {
      await showAlert(err.message || `Failed to update job status to ${newStatus}`);
    } finally {
      setMutation(null);
    }
  };

  const handlePublishResults = async (jobId) => {
    const confirmed = await showConfirm(
      "Are you sure you want to publish results? This will notify candidates of their final status. This action cannot be undone.",
      { type: "info" }
    );
    if (!confirmed) return;

    setMutation({ jobId, action: "publish" });
    try {
      const res = await api.post(`/jobs/v1/${jobId}/publish-results`);
      const updatedJob = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    } catch (err) {
      await showAlert(err.message || "Failed to publish results");
    } finally {
      setMutation(null);
    }
  };


  const stats = useMemo(
    () => ({
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j) => j.status === "ACTIVE").length,
      draftJobs: jobs.filter((j) => j.status === "DRAFT").length,
      totalApplications: jobs.reduce(
        (sum, j) => sum + (j.applicationsCount || 0),
        0,
      ),
      totalViews: jobs.reduce((sum, j) => sum + (j.viewsCount || 0), 0),
    }),
    [jobs],
  );

  const filteredJobs = jobs.filter(
    (job) => jobFilter === "ALL" || job.status === jobFilter,
  );

  const companyLogoUrl = resolveLogoUrl(company, company?.data, user);

  useEffect(() => {
    setImgError(false);
  }, [companyLogoUrl]);

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Seo title="InternNova | Dashboard" description="Manage your company's internship postings, applicants, and dashboard statistics." path="/dashboard/company" />
        <CompanyDashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Seo title="InternNova | Dashboard" description="Manage your company's internship postings, applicants, and dashboard statistics." path="/dashboard/company" />
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <Seo title="InternNova | Dashboard" description="Manage your company's internship postings, applicants, and dashboard statistics." path="/dashboard/company" />
      <section className="dashboard-hero mb-8">
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr] lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Welcome to InternNova
            </p>
            <h1 className="hero-title mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              {company?.companyName
                ? `${company.companyName}'s Dashboard`
                : "Build your hiring pipeline"}
            </h1>
            <p className="mt-4 max-w-2xl text-base opacity-80">
              Track live roles, keep applications moving, and jump straight into
              the next hiring action.
            </p>
            <div className="panel-cta mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/jobs/create" className="btn-primary justify-center sm:justify-start">
                <IoAddOutline className="h-5 w-5" />
                Post new job
              </Link>
              <Link to="/company/applications" className="btn-secondary justify-center sm:justify-start">
                <IoDocumentTextOutline className="h-5 w-5" />
                Review applications
              </Link>
            </div>
          </div>

          <div className="dashboard-profile-card flex flex-col justify-between min-w-0 w-full overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Profile
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {company?.companyName || "Not completed"}
                </h2>
              </div>
              <div className="logo-circle flex h-14 w-14 overflow-hidden items-center justify-center rounded-2xl text-emerald-600 dark:text-emerald-400">
                {companyLogoUrl && !imgError ? (
                  <img
                    src={companyLogoUrl}
                    alt={company.companyName || "Company logo"}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <IoPersonOutline className="h-6 w-6" />
                )}
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="glass-card p-3 sm:p-4 min-w-0">
                <p className="text-xs font-medium opacity-60">Industry</p>
                <p className="mt-1 font-semibold truncate" title={company?.companyType || "Add details"}>
                  {company?.companyType || "Add details"}
                </p>
              </div>
              <div className="glass-card p-3 sm:p-4 min-w-0">
                <p className="text-xs font-medium opacity-60">Team size</p>
                <p className="mt-1 font-semibold truncate" title={company?.companySize ? `${company.companySize} employees` : "Add size"}>
                  {company?.companySize
                    ? `${company.companySize} employees`
                    : "Add size"}
                </p>
              </div>
            </div>
            <Link
              to="/company/profile"
              className="btn-primary w-full mt-6"
            >
              <IoPersonOutline className="h-5 w-5" />
              Company Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          ["Total jobs", stats.totalJobs, IoBriefcaseOutline],
          ["Active", stats.activeJobs, IoCheckmarkCircleOutline],
          ["Drafts", stats.draftJobs, IoCreateOutline],
          ["Applications", stats.totalApplications, IoDocumentTextOutline],
          ["Views", stats.totalViews, IoEyeOutline],
        ].map(([label, value, Icon], index) => (
          <div
            key={label}
            className={`glass-card p-3 sm:p-5 transition-transform hover:-translate-y-1 ${
              index === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2.5">
              <p className="text-xs sm:text-sm font-medium opacity-70 truncate">{label}</p>
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="glass-panel flex h-auto lg:h-[42rem] flex-col p-4 sm:p-6 min-w-0 w-full overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-black/5 dark:border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Job board
              </p>
              <h2 className="mt-1 text-2xl font-bold">Your posted roles</h2>
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-2.5">
              {JOB_FILTERS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setJobFilter(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    jobFilter === tab
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex-1 space-y-4 overflow-y-auto pr-2 card-scroll-region">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="glass-card p-4 sm:p-5 hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <h3 className="text-lg font-bold truncate">
                          {job.title}
                        </h3>
                        <StatusBadge status={job.status} className="shrink-0" />
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm opacity-70">
                        <IoLocationOutline className="h-4 w-4" />
                        {job.location || "Location not set"}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-black/5 dark:bg-white/5 px-4 py-2 text-center">
                        <p className="text-xs font-medium opacity-60">Apps</p>
                        <p className="font-bold">
                          {job.applicationsCount || 0}
                        </p>
                      </div>
                      <div className="rounded-xl bg-black/5 dark:bg-white/5 px-4 py-2 text-center">
                        <p className="text-xs font-medium opacity-60">Views</p>
                        <p className="font-bold">{job.viewsCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 dark:border-white/5 pt-4">
                    <Link
                      to={`/jobs/${job.id}/applications`}
                      className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      Applications
                    </Link>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="rounded-full bg-black/5 dark:bg-white/10 px-4 py-1.5 text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    >
                      Edit
                    </Link>
                    {new Date(job.applicationDeadline) < new Date() && !job.resultsPublished && job.status !== "DRAFT" && (
                      <button
                        onClick={() => handlePublishResults(job.id)}
                        disabled={mutation?.jobId === job.id}
                        className="rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {mutation?.jobId === job.id && mutation?.action === "publish" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Publishing...</>
                        ) : "Publish Results"}
                      </button>
                    )}
                    {job.status === "ACTIVE" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "CLOSED")}
                        disabled={mutation?.jobId === job.id}
                        className="rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {mutation?.jobId === job.id && mutation?.action === "CLOSED" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Closing...</>
                        ) : "Close"}
                      </button>
                    )}
                    {job.status === "DRAFT" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "ACTIVE")}
                        disabled={mutation?.jobId === job.id}
                        className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
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
                          className="rounded-full bg-black/5 dark:bg-white/10 px-4 py-1.5 text-xs font-semibold hover:bg-black/10 dark:hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {mutation?.jobId === job.id && mutation?.action === "ARCHIVED" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Archiving...</>
                          ) : "Archive"}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateJobStatus(job.id, "ACTIVE")
                          }
                          disabled={mutation?.jobId === job.id}
                          className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {mutation?.jobId === job.id && mutation?.action === "ACTIVE" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Reopening...</>
                          ) : "Reopen"}
                        </button>
                      </>
                    )}
                    {job.status === "ARCHIVED" && (
                      <button
                        onClick={() => handleUpdateJobStatus(job.id, "ACTIVE")}
                        disabled={mutation?.jobId === job.id}
                        className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {mutation?.jobId === job.id && mutation?.action === "ACTIVE" ? (
                          <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Reopening...</>
                        ) : "Reopen"}
                      </button>
                    )}
                    {(!job.applicationsCount || job.applicationsCount === 0) &&
                      job.status !== "ARCHIVED" && (
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={mutation?.jobId === job.id}
                          className="rounded-full bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {mutation?.jobId === job.id && mutation?.action === "delete" ? (
                            <><span className="inline-block h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />Deleting...</>
                          ) : "Delete"}
                        </button>
                      )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 p-12 text-center">
                <IoBriefcaseOutline className="mx-auto h-12 w-12 opacity-40" />
                <h3 className="mt-4 text-lg font-bold">
                  No roles in this view
                </h3>
                <p className="mt-2 text-sm opacity-70">
                  Start with a fresh posting or change the current filter.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-col gap-6 md:gap-4 lg:gap-0 lg:h-[42rem]">
          <div className="glass-panel flex flex-col p-4 sm:p-6 h-auto lg:h-full lg:flex-1 lg:min-h-0 min-w-0 w-full overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Live feed
                </p>
                <h2 className="mt-1 text-xl font-bold">Recent applications</h2>
              </div>
              <Link
                to="/company/applications"
                className="text-sm font-semibold opacity-70 hover:opacity-100 transition-opacity"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 max-h-[25rem] lg:max-h-none overflow-y-auto pr-2 card-scroll-region lg:flex-1 space-y-3">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="block glass-card p-4 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold truncate">
                          {app.studentName || "Applicant"}
                        </h3>
                        <p className="mt-1 text-sm opacity-70 truncate">
                          {app.jobTitle}
                        </p>
                      </div>
                      <StatusBadge status={app.status} className="text-[0.68rem] shrink-0" />
                    </div>
                    {app.appliedAt && (
                      <p className="mt-3 text-xs opacity-50">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-8 text-center">
                  <IoDocumentTextOutline className="mx-auto h-10 w-10 opacity-40" />
                  <p className="mt-3 text-sm opacity-70">No applications yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-hero p-4 sm:p-6 text-center lg:text-left mt-6 md:mt-0 lg:mt-6 min-w-0 w-full overflow-hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 mb-4">
              <IoFlashOutline className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold">Next best move</h2>
            <p className="mt-2 text-sm opacity-80">
              Keep active roles fresh and archive closed roles so applicants see
              the cleanest version of your company.
            </p>
            <div className="panel-cta mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Link to="/jobs/create" className="btn-primary flex-1 justify-center">
                Post job
              </Link>
              <Link to="/company/applications" className="btn-secondary flex-1 justify-center">
                Review
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CompanyDashboard;
