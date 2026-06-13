import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { JobDetailsSkeleton } from "../components/Skeleton.jsx";
import JobApplicationForm from "../components/JobApplicationForm";

function formatSalary(min, max) {
  if (!min && !max) return "Not specified";
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max)}`;
}

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isCompany = user?.role === "Company";
  const isTalent = user?.role === "Talent";

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id, user?.id]);

  const fetchJob = async () => {
    setLoading(true);
    setError("");
    try {
      const url = user?.id
        ? `/jobs/v1/${id}?viewerId=${user.id}`
        : `/jobs/v1/${id}`;
      const res = await api.get(url);
      const jobData = await res.json();
      setJob(jobData);

      if (isTalent && user) {
        try {
          const appsRes = await api.get(
            `/applications/v1/student/${user.id}?page=-1&size=-1`,
          );
          const apps = await appsRes.json();
          const list = Array.isArray(apps) ? apps : apps.content || [];
          setHasApplied(list.some((a) => String(a.jobId) === String(id)));

          const profileRes = await api.get(`/talent/v1/${user.id}`);
          const profile = await profileRes.json();
          if (profile.savedJobs && profile.savedJobs.includes(id)) {
            setIsSaved(true);
          }
        } catch {}
      }
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationSubmit = async (applicationData) => {
    try {
      const payloadData = {
        jobId: id,
        studentId: user?.id,
        coverLetter: applicationData.get("coverLetter"),
        resumeUrl: applicationData.get("resumeUrl") || undefined,
      };
      const formData = new FormData();
      formData.append("data", JSON.stringify(payloadData));

      const resumeFile = applicationData.get("resumeFile");
      if (resumeFile) {
        formData.append("resumeFile", resumeFile);
      }

      await api.post("/applications/v1", formData);

      setHasApplied(true);
      setApplySuccess(true);
      setShowApplicationForm(false);
    } catch (err) {
      alert(err.message || "Failed to submit application. Please try again.");
    }
  };

  const handleToggleSave = async () => {
    if (!user || user.role !== "Talent") return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/talent/v1/${user.id}/saved-jobs/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/talent/v1/${user.id}/saved-jobs/${id}`);
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.message || "Failed to update saved jobs list.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-rose-500 mb-4">{error || "Job not found"}</p>
          <Link
            to="/jobs"
            className="btn-primary px-4 py-2 text-sm font-medium"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {showApplicationForm && (
        <JobApplicationForm
          job={job}
          onSubmit={handleApplicationSubmit}
          onCancel={() => setShowApplicationForm(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {applySuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
            Application submitted successfully! Track its status in{" "}
            <Link to="/applications" className="underline font-medium">
              My Applications
            </Link>
            .
          </div>
        )}

        {/* Hero Card */}
        <div className="glass-card p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {job.title}
                </h1>
                {job.remoteOption && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                    Remote
                  </span>
                )}
                {job.jobType && (
                  <span className="px-2.5 py-1 bg-brand-100 text-slate-900 rounded-lg text-xs font-medium border border-brand-200">
                    {job.jobType.replace("_", " ")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 mb-4">
                <span className="font-medium">{job.location}</span>
                {job.duration && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{job.duration}</span>
                  </>
                )}
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-medium">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
              </div>
              {(job.startDate || job.applicationDeadline) && (
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  {job.startDate && (
                    <span>
                      Start: {new Date(job.startDate).toLocaleDateString()}
                    </span>
                  )}
                  {job.applicationDeadline && (
                    <span>
                      Deadline:{" "}
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-3">
              {isTalent &&
                (hasApplied ? (
                  <div className="px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                    Applied
                  </div>
                ) : job.status === "CLOSED" || job.status === "ARCHIVED" ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed"
                  >
                    This job is no longer accepting applications.
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleToggleSave}
                      disabled={saveLoading}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors border flex items-center justify-center ${
                        isSaved
                          ? "bg-brand-100 text-slate-900 border-brand-200 hover:bg-brand-200"
                          : "bg-white/70 text-slate-700 border-white/60 hover:bg-white/80"
                      }`}
                      title={
                        isSaved
                          ? "Remove from saved jobs"
                          : "Save this job for later"
                      }
                    >
                      {saveLoading ? "..." : isSaved ? "★ Saved" : "☆ Save"}
                    </button>
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="btn-primary px-6 py-3 font-medium"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              {isCompany && user.id === job.companyId && (
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="btn-secondary px-6 py-3 font-medium"
                >
                  Edit Job
                </Link>
              )}
              {isCompany && (
                <Link
                  to={`/jobs/${job.id}/applications`}
                  className="btn-primary px-6 py-3 font-medium"
                >
                  View Applications
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn-primary px-6 py-3 font-medium">
                  Sign In to Apply
                </Link>
              )}
              <div className="text-right text-xs text-slate-400">
                <p>{job.applicationsCount || 0} applicants</p>
                <p>{job.viewsCount || 0} views</p>
              </div>
            </div>
          </div>
          {job.skillsRequired?.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wide">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-brand-100 text-slate-900 rounded-lg text-sm font-medium border border-brand-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {job.description && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Job Description
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            )}
            {job.responsibilities && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Responsibilities
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}
            {job.requirements && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Requirements
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Job Overview
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-500">Job Type</dt>
                  <dd className="text-slate-700">
                    {job.jobType?.replace("_", " ") || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Location</dt>
                  <dd className="text-slate-700">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Work Style</dt>
                  <dd className="text-slate-700">
                    {job.remoteOption ? "Remote / Hybrid" : "On-site"}
                  </dd>
                </div>
                {job.duration && (
                  <div>
                    <dt className="text-xs text-slate-500">Duration</dt>
                    <dd className="text-slate-700">{job.duration}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-slate-500">Salary</dt>
                  <dd className="text-emerald-600 font-medium">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Applications</dt>
                  <dd className="text-slate-700">
                    {job.applicationsCount || 0}
                  </dd>
                </div>
              </dl>
            </div>

            {isTalent && !hasApplied && job.status === "ACTIVE" && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="btn-primary w-full py-3 rounded-xl font-semibold"
              >
                Apply for this Job
              </button>
            )}
            {isTalent &&
              !hasApplied &&
              (job.status === "CLOSED" || job.status === "ARCHIVED") && (
                <button
                  disabled
                  className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-semibold cursor-not-allowed"
                >
                  This job is no longer accepting applications.
                </button>
              )}

            {isTalent && job.status === "ACTIVE" && (
              <button
                onClick={handleToggleSave}
                disabled={saveLoading}
                className={`w-full py-3 mt-3 rounded-xl font-semibold transition-colors border ${
                  isSaved
                    ? "bg-brand-100 text-slate-900 border-brand-200 hover:bg-brand-200"
                    : "bg-white/70 text-slate-700 border-white/60 hover:bg-white/80"
                }`}
              >
                {saveLoading
                  ? "Loading..."
                  : isSaved
                    ? "Remove from Saved Jobs"
                    : "Save Job for Later"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
