import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { DashboardSkeleton } from "../components/Skeleton.jsx";
import {
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoAddOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoArchiveOutline,
  IoPlayOutline,
  IoCloseCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobFilter, setJobFilter] = useState("ALL");

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
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/jobs/v1/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      alert(err.message || "Failed to delete job");
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    if (
      !confirm(
        `Are you sure you want to change this job's status to ${newStatus}?`,
      )
    )
      return;
    try {
      const res = await api.put(`/jobs/v1/${jobId}`, { status: newStatus });
      const updatedJob = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));
    } catch (err) {
      alert(err.message || `Failed to update job status to ${newStatus}`);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      APPLIED: "text-amber-600",
      UNDER_REVIEW: "text-emerald-600",
      SHORTLISTED: "text-lime-600",
      INTERVIEW: "text-teal-600",
      OFFER: "text-green-700",
      HIRED: "text-emerald-700",
      REJECTED: "text-rose-600",
      DRAFT: "text-slate-500",
      ACTIVE: "text-emerald-600",
      CLOSED: "text-amber-600",
      ARCHIVED: "text-slate-500",
      WITHDRAWN: "text-slate-500",
    };
    return map[status] || "text-slate-500";
  };

  const getStatusBg = (status) => {
    const map = {
      APPLIED: "bg-amber-50 border-amber-200",
      UNDER_REVIEW: "bg-emerald-50 border-emerald-200",
      SHORTLISTED: "bg-lime-50 border-lime-200",
      INTERVIEW: "bg-teal-50 border-teal-200",
      OFFER: "bg-green-50 border-green-200",
      HIRED: "bg-emerald-100 border-emerald-200",
      REJECTED: "bg-rose-50 border-rose-200",
      DRAFT: "bg-slate-50 border-slate-200",
      ACTIVE: "bg-emerald-50 border-emerald-200",
      CLOSED: "bg-amber-50 border-amber-200",
      ARCHIVED: "bg-slate-50 border-slate-200",
      WITHDRAWN: "bg-slate-50 border-slate-200",
    };
    return map[status] || "bg-slate-50 border-slate-200";
  };

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "ACTIVE").length,
    totalApplications: jobs.reduce(
      (sum, j) => sum + (j.applicationsCount || 0),
      0,
    ),
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="glass-card text-center max-w-md p-6">
            <p className="text-rose-500 mb-4">{error}</p>
            <button onClick={fetchDashboardData} className="btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {company?.companyName
            ? `${company.companyName} Dashboard`
            : "Company Dashboard"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your job postings and review applications.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Jobs",
            value: stats.totalJobs,
            icon: IoBriefcaseOutline,
            color: "text-emerald-700",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Active Jobs",
            value: stats.activeJobs,
            icon: IoCheckmarkCircleOutline,
            color: "text-emerald-600",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Total Applications",
            value: stats.totalApplications,
            icon: IoDocumentTextOutline,
            color: "text-lime-700",
            iconBg: "bg-lime-100",
          },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                {label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile + Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Company Profile
            </h2>
            {company ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Company Name</p>
                  <p className="text-sm text-slate-700 font-medium">
                    {company.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Company Size</p>
                  <p className="text-sm text-slate-700">
                    {company.companySize} employees
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Industry</p>
                  <p className="text-sm text-slate-700">
                    {company.companyType}
                  </p>
                </div>
                {company.foundedYear && (
                  <div>
                    <p className="text-xs text-slate-500">Founded</p>
                    <p className="text-sm text-slate-700">
                      {company.foundedYear}
                    </p>
                  </div>
                )}
                {company.websiteUrl && (
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <a
                      href={company.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-800 hover:text-slate-950 text-sm transition-colors"
                    >
                      {company.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                Profile not found. Complete your profile to get started.
              </p>
            )}
            <Link
              to="/company/profile/edit"
              className="btn-primary mt-4 w-full !text-sm"
            >
              <IoPersonOutline className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/jobs/create"
                className="flex items-center gap-3 p-3 bg-brand-100 hover:bg-brand-200 border border-brand-200 rounded-xl text-sm text-slate-900 font-medium transition-colors"
              >
                <IoAddOutline className="w-4 h-4" />
                Post New Job
              </Link>
              <Link
                to="/company/applications"
                className="flex items-center gap-3 p-3 bg-white/70 hover:bg-white/80 border border-white/60 rounded-xl text-sm text-slate-700 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                Review Applications
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column — Job Postings */}
        <div className="glass-card p-6">
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-slate-900 whitespace-nowrap">
              Your Job Postings
            </h2>
            <div className="flex flex-wrap gap-1 bg-white/60 p-1 rounded-lg border border-white/50">
              {["ALL", "DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setJobFilter(tab)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    jobFilter === tab
                      ? "bg-white/80 text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {jobs.filter((j) => jobFilter === "ALL" || j.status === jobFilter)
              .length > 0 ? (
              jobs
                .filter((j) => jobFilter === "ALL" || j.status === jobFilter)
                .map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 bg-white/60 rounded-xl border border-white/50 hover:border-white/70 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-slate-800 text-sm">
                        {job.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getStatusBg(job.status)} ${getStatusColor(job.status)}`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">
                      {job.location}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <IoDocumentTextOutline className="w-3 h-3" />
                        {job.applicationsCount || 0} apps
                      </span>
                      <span className="flex items-center gap-1">
                        <IoEyeOutline className="w-3 h-3" />
                        {job.viewsCount || 0} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors font-medium"
                      >
                        <IoDocumentTextOutline className="w-3 h-3" />
                        Applications
                      </Link>
                      <span className="text-slate-300">•</span>
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="text-xs text-slate-600 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        <IoCreateOutline className="w-3 h-3" />
                        Edit
                      </Link>
                      {(!job.applicationsCount ||
                        job.applicationsCount === 0) &&
                        job.status !== "ARCHIVED" && (
                          <>
                            <span className="text-slate-300">•</span>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                            >
                              <IoTrashOutline className="w-3 h-3" />
                              Delete
                            </button>
                          </>
                        )}
                      {job.status === "ACTIVE" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "CLOSED")
                            }
                            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
                          >
                            <IoCloseCircleOutline className="w-3 h-3" />
                            Close
                          </button>
                        </>
                      )}
                      {job.status === "DRAFT" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "ACTIVE")
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                          >
                            <IoPlayOutline className="w-3 h-3" />
                            Publish
                          </button>
                        </>
                      )}
                      {job.status === "CLOSED" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "ARCHIVED")
                            }
                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <IoArchiveOutline className="w-3 h-3" />
                            Archive
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "ACTIVE")
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                          >
                            <IoRefreshOutline className="w-3 h-3" />
                            Reopen
                          </button>
                        </>
                      )}
                      {job.status === "ARCHIVED" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <button
                            onClick={() =>
                              handleUpdateJobStatus(job.id, "ACTIVE")
                            }
                            className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                          >
                            <IoRefreshOutline className="w-3 h-3" />
                            Reopen
                          </button>
                          {(!job.applicationsCount ||
                            job.applicationsCount === 0) && (
                            <>
                              <span className="text-slate-300">•</span>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                              >
                                <IoTrashOutline className="w-3 h-3" />
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-10">
                <IoBriefcaseOutline className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4 text-sm">
                  No job postings yet
                </p>
                <Link to="/jobs/create" className="btn-primary !text-sm">
                  Post Your First Job
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Recent Applications */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Applications
            </h2>
            <Link
              to="/company/applications"
              className="text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-white/60 rounded-xl border border-white/50 hover:border-white/70 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium text-slate-800 text-sm">
                        {app.studentName || "Applicant"}
                      </h3>
                      <p className="text-xs text-slate-500">{app.jobTitle}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getStatusBg(app.status)} ${getStatusColor(app.status)}`}
                    >
                      {app.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  {app.aiMatchScore != null && (
                    <p className="text-xs text-slate-500 mt-2">
                      Match:{" "}
                      <span className="text-emerald-600 font-medium">
                        {app.aiMatchScore}%
                      </span>
                    </p>
                  )}
                  {app.appliedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                  <Link
                    to={`/applications/${app.id}`}
                    className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    Review →
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <IoDocumentTextOutline className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
