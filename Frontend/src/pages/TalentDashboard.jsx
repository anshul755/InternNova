import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { DashboardSkeleton } from "../components/Skeleton.jsx";
import {
  IoBookmarkOutline,
  IoBriefcaseOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoRocketOutline,
  IoSearchOutline,
  IoStatsChartOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
} from "react-icons/io5";

const TalentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const profilePromise = api
        .get(`/talent/v1/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          const isNotFound = String(err?.message || "").includes("404");
          if (isNotFound) return null;
          throw err;
        });

      const appsPromise = api
        .get(
          `/applications/v1/student/${user.id}?page=0&size=5&sortBy=appliedAt&sortDir=desc`,
        )
        .then((res) => res.json());

      const jobsPromise = api
        .get("/jobs/v1?page=0&size=5&sortBy=createdAt&sortDir=desc")
        .then((res) => res.json());

      const [profileData, appsData, jobsData] = await Promise.all([
        profilePromise,
        appsPromise,
        jobsPromise,
      ]);

      setProfile(profileData);
      setApplications(
        Array.isArray(appsData) ? appsData : appsData.content || [],
      );
      setRecentJobs(
        Array.isArray(jobsData) ? jobsData : jobsData.content || [],
      );
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPLIED":
        return "text-amber-700 dark:text-amber-400";
      case "UNDER_REVIEW":
        return "text-emerald-700 dark:text-emerald-400";
      case "SHORTLISTED":
        return "text-lime-700 dark:text-lime-400";
      case "INTERVIEW":
        return "text-teal-700 dark:text-teal-400";
      case "OFFER":
        return "text-green-700 dark:text-green-400";
      case "HIRED":
        return "text-emerald-700 dark:text-emerald-400";
      case "REJECTED":
        return "text-rose-700 dark:text-rose-400";
      case "WITHDRAWN":
        return "text-slate-600 dark:text-slate-400";
      default:
        return "text-slate-600 dark:text-slate-400";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50";
      case "UNDER_REVIEW":
        return "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700/50";
      case "SHORTLISTED":
        return "bg-lime-50 dark:bg-lime-900/30 border-lime-200 dark:border-lime-700/50";
      case "INTERVIEW":
        return "bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700/50";
      case "OFFER":
        return "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50";
      case "HIRED":
        return "bg-emerald-100 dark:bg-emerald-800/40 border-emerald-200 dark:border-emerald-600/50";
      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700/50";
      case "WITHDRAWN":
        return "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700/50";
      default:
        return "bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700/50";
    }
  };

  const stats = useMemo(
    () => ({
      applied: applications.filter((a) => a.status === "APPLIED").length,
      inProgress: applications.filter((a) =>
        ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW"].includes(a.status),
      ).length,
      offers: applications.filter((a) => ["OFFER", "HIRED"].includes(a.status))
        .length,
      total: applications.length,
    }),
    [applications],
  );

  const featuredJob = recentJobs[0];

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
      <section className="dashboard-hero mb-8">
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Talent workspace
            </p>
            <h1 className="hero-title mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Welcome back{profile?.name ? `, ${profile.name}` : ""}
            </h1>
            <p className="mt-4 max-w-2xl text-base opacity-80">
              Follow your applications, keep your profile sharp, and discover
              roles worth applying to next.
            </p>
            <div className="panel-cta mt-8 flex flex-wrap gap-4">
              <Link to="/jobs" className="btn-primary">
                <IoSearchOutline className="h-5 w-5" />
                Browse jobs
              </Link>
              <Link to="/saved-jobs" className="btn-secondary">
                <IoBookmarkOutline className="h-5 w-5" />
                Saved jobs
              </Link>
              <Link to="/applications" className="btn-secondary">
                <IoDocumentTextOutline className="h-5 w-5" />
                Applications
              </Link>
            </div>
          </div>

          <div className="dashboard-profile-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Profile signal
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {profile ? "Ready to apply" : "Profile needed"}
                </h2>
              </div>
              <div className="logo-circle flex h-14 w-14 items-center justify-center rounded-2xl text-emerald-600 dark:text-emerald-400">
                <IoPersonOutline className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 space-y-2 font-medium opacity-80">
              <p>
                {profile?.university || "Add university"}{" "}
                {profile?.major ? `- ${profile.major}` : ""}
              </p>
              {profile?.cgpa && <p>CGPA: {profile.cgpa}/10</p>}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(profile?.skills || []).slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
              {!profile?.skills?.length && (
                <span className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-semibold">
                  Add skills
                </span>
              )}
            </div>

            <Link
              to="/profile/edit"
              className="btn-primary w-full mt-6"
            >
              Update profile
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          [
            "Applied",
            stats.applied,
            IoDocumentTextOutline,
            "text-amber-600 dark:text-amber-400",
            "bg-amber-500/10",
          ],
          [
            "In progress",
            stats.inProgress,
            IoTimeOutline,
            "text-emerald-600 dark:text-emerald-400",
            "bg-emerald-500/10",
          ],
          [
            "Offers",
            stats.offers,
            IoCheckmarkCircleOutline,
            "text-lime-600 dark:text-lime-400",
            "bg-lime-500/10",
          ],
          [
            "Total",
            stats.total,
            IoStatsChartOutline,
            "text-slate-600 dark:text-slate-400",
            "bg-black/5 dark:bg-white/10",
          ],
        ].map(([label, value, Icon, iconColor, iconBg]) => (
          <div
            key={label}
            className="glass-card p-5 transition-transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium opacity-70">{label}</p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Application trail
                </p>
                <h2 className="mt-1 text-2xl font-bold">Recent activity</h2>
              </div>
              <Link
                to="/applications"
                className="text-sm font-semibold opacity-70 transition-opacity hover:opacity-100"
              >
                View all
              </Link>
            </div>

            <div className="card-scroll-region relative mt-6 max-h-[30rem] space-y-4 overflow-y-auto pr-2">
              {applications.length > 0 ? (
                applications.map((app, index) => (
                  <article key={app.id} className="relative pl-8">
                    <div className="absolute left-2 top-2 h-full w-px bg-black/10 dark:bg-white/10" />
                    <div className="absolute left-0 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                    <div className="glass-card p-4 transition-colors hover:border-emerald-500/30">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
                            Step {index + 1}
                          </p>
                          <h3 className="mt-1 font-bold">{app.jobTitle}</h3>
                          <p className="mt-1 text-sm opacity-70">
                            {app.companyName || "Company"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBg(
                            app.status,
                          )} ${getStatusColor(app.status)}`}
                        >
                          {app.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      {app.appliedAt && (
                        <p className="mt-3 text-xs opacity-50">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-black/20 bg-black/5 p-10 text-center dark:border-white/20 dark:bg-white/5">
                  <IoRocketOutline className="mx-auto h-10 w-10 opacity-40" />
                  <h3 className="mt-4 text-lg font-bold">
                    No applications yet
                  </h3>
                  <p className="mt-2 text-sm opacity-70">
                    Browse roles and send your first application.
                  </p>
                  <Link to="/jobs" className="btn-primary mt-6 inline-flex">
                    Browse jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Job radar
                </p>
                <h2 className="mt-1 text-2xl font-bold">Fresh postings</h2>
              </div>
              <Link
                to="/jobs"
                className="text-sm font-semibold opacity-70 transition-opacity hover:opacity-100"
              >
                View all
              </Link>
            </div>

            <div className="card-scroll-region mt-6 grid max-h-[28rem] gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs/${job.id}`}
                    className="glass-card flex flex-col justify-between p-4 transition-colors hover:border-emerald-500/40"
                  >
                    <div>
                      <IoBriefcaseOutline className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="mt-4 font-bold">{job.title}</h3>
                      <p className="mt-2 text-sm opacity-70">
                        {job.location || "Location not set"}
                      </p>
                    </div>
                    {job.salaryMin && job.salaryMax && (
                      <p className="mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ${job.salaryMin.toLocaleString()} - $
                        {job.salaryMax.toLocaleString()}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl bg-black/5 p-8 text-center text-sm opacity-70 dark:bg-white/5 md:col-span-2">
                  No jobs available
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TalentDashboard;
