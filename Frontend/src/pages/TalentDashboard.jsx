import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import { DashboardSkeleton } from "../components/Skeleton.jsx";
import {
  IoBriefcaseOutline,
  IoDocumentTextOutline,
  IoBookmarkOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoStatsChartOutline,
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
        return "text-amber-600";
      case "UNDER_REVIEW":
        return "text-emerald-600";
      case "SHORTLISTED":
        return "text-lime-600";
      case "INTERVIEW":
        return "text-teal-600";
      case "OFFER":
        return "text-green-700";
      case "HIRED":
        return "text-emerald-700";
      case "REJECTED":
        return "text-rose-600";
      case "WITHDRAWN":
        return "text-slate-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-amber-50 border-amber-200";
      case "UNDER_REVIEW":
        return "bg-emerald-50 border-emerald-200";
      case "SHORTLISTED":
        return "bg-lime-50 border-lime-200";
      case "INTERVIEW":
        return "bg-teal-50 border-teal-200";
      case "OFFER":
        return "bg-green-50 border-green-200";
      case "HIRED":
        return "bg-emerald-100 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 border-rose-200";
      case "WITHDRAWN":
        return "bg-slate-50 border-slate-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const stats = {
    applied: applications.filter((a) => a.status === "APPLIED").length,
    inProgress: applications.filter((a) =>
      ["UNDER_REVIEW", "SHORTLISTED", "INTERVIEW"].includes(a.status),
    ).length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
    offers: applications.filter((a) => ["OFFER", "HIRED"].includes(a.status))
      .length,
    total: applications.length,
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
          Welcome back{profile?.name ? `, ${profile.name}` : ""}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's your internship journey at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Applied",
            value: stats.applied,
            icon: IoDocumentTextOutline,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            iconBg: "bg-amber-100",
          },
          {
            label: "In Progress",
            value: stats.inProgress,
            icon: IoTimeOutline,
            color: "text-emerald-700",
            bgColor: "bg-emerald-50",
            iconBg: "bg-emerald-100",
          },
          {
            label: "Offers",
            value: stats.offers,
            icon: IoCheckmarkCircleOutline,
            color: "text-green-700",
            bgColor: "bg-green-50",
            iconBg: "bg-green-100",
          },
          {
            label: "Total",
            value: stats.total,
            icon: IoStatsChartOutline,
            color: "text-slate-700",
            bgColor: "bg-slate-50",
            iconBg: "bg-slate-100",
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
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Profile + Quick Actions */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Your Profile
            </h2>
            {profile ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm text-slate-700 font-medium">
                    {profile.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">University</p>
                  <p className="text-sm text-slate-700">{profile.university}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Major</p>
                  <p className="text-sm text-slate-700">{profile.major}</p>
                </div>
                {profile.cgpa && (
                  <div>
                    <p className="text-xs text-slate-500">CGPA</p>
                    <p className="text-sm text-slate-700">{profile.cgpa}/10</p>
                  </div>
                )}
                {profile.skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-brand-100 text-slate-900 rounded-lg text-xs font-medium border border-brand-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                Profile not found. Please complete your profile.
              </p>
            )}
            <Link
              to="/profile/edit"
              className="btn-primary mt-4 w-full !text-sm"
            >
              <IoPersonOutline className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                to="/jobs"
                className="flex items-center gap-3 p-3 bg-brand-100 hover:bg-brand-200 border border-brand-200 rounded-xl text-sm text-slate-900 font-medium transition-colors"
              >
                <IoBriefcaseOutline className="w-4 h-4" />
                Browse Jobs
              </Link>
              <Link
                to="/applications"
                className="flex items-center gap-3 p-3 bg-white/70 hover:bg-white/80 border border-white/60 rounded-xl text-sm text-slate-700 transition-colors"
              >
                <IoDocumentTextOutline className="w-4 h-4" />
                My Applications
              </Link>
              <Link
                to="/saved-jobs"
                className="flex items-center gap-3 p-3 bg-white/70 hover:bg-white/80 border border-white/60 rounded-xl text-sm text-slate-700 transition-colors"
              >
                <IoBookmarkOutline className="w-4 h-4" />
                Saved Jobs
              </Link>
            </div>
          </div>
        </div>

        {/* Center Column — Recent Applications */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Applications
            </h2>
            <Link
              to="/applications"
              className="text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {applications.length > 0 ? (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 bg-white/60 rounded-xl border border-white/50 hover:border-white/70 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800 text-sm">
                      {app.jobTitle}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getStatusBg(app.status)} ${getStatusColor(app.status)}`}
                    >
                      {app.status?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{app.companyName}</p>
                  {app.appliedAt && (
                    <p className="text-xs text-slate-400 mt-2">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <IoBriefcaseOutline className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 mb-4 text-sm">
                  No applications yet
                </p>
                <Link to="/jobs" className="btn-primary !text-sm">
                  Browse Jobs
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column — Recent Jobs */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Job Posts
            </h2>
            <Link
              to="/jobs"
              className="text-xs text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block p-3.5 bg-white/60 rounded-xl border border-white/50 hover:border-white/70 hover:shadow-sm transition-all group"
                >
                  <h3 className="font-medium text-slate-800 text-sm mb-1 group-hover:text-emerald-600 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500">{job.location}</p>
                  {job.salaryMin && job.salaryMax && (
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                      ${job.salaryMin.toLocaleString()} – $
                      {job.salaryMax.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">
                No jobs available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;
