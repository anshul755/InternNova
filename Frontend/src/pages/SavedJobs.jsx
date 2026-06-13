import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { SavedJobsSkeleton } from "../components/Skeleton.jsx";

const formatSalary = (min, max) => {
  if (!min && !max) return "";
  if (min && max)
    return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
  if (min) return `From ₹${min.toLocaleString("en-IN")}`;
  return `Up to ₹${max.toLocaleString("en-IN")}`;
};

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSavedJobs = useCallback(async () => {
    if (!user || user.role !== "Talent") return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/talent/v1/${user.id}/saved-jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  const removeSavedJob = async (jobId) => {
    try {
      await api.delete(`/talent/v1/${user.id}/saved-jobs/${jobId}`);
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
    } catch (err) {
      alert(err.message || "Failed to remove saved job.");
    }
  };

  if (loading) {
    return <SavedJobsSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
          <p className="text-slate-500 mt-1">
            Review and apply to jobs you've bookmarked for later.
          </p>
        </div>
        <Link
          to="/jobs"
          className="btn-secondary px-4 py-2 text-sm font-medium"
        >
          Browse More Jobs
        </Link>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-600">
          {error}
          <button
            onClick={fetchSavedJobs}
            className="ml-3 text-rose-700 hover:text-rose-800 underline text-sm font-medium"
          >
            Retry
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h2 className="text-xl font-medium text-slate-900 mb-2">
            No saved jobs yet
          </h2>
          <p className="text-slate-500 mb-6">
            Jobs you save will appear here for easy access.
          </p>
          <Link
            to="/jobs"
            className="btn-primary px-6 py-2.5 inline-block font-medium"
          >
            Find jobs to save
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card p-6">
              <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-slate-950 transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.status === "CLOSED" || job.status === "ARCHIVED" ? (
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium border border-rose-100">
                        No longer accepting applications
                      </span>
                    ) : (
                      <>
                        {job.remoteOption && (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100">
                            Remote
                          </span>
                        )}
                        {job.jobType && (
                          <span className="px-2.5 py-0.5 bg-brand-100 text-slate-900 rounded-lg text-xs font-medium border border-brand-200">
                            {job.jobType.replace("_", " ")}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                    <span className="text-slate-700 font-medium">
                      {job.location}
                    </span>
                    {job.duration && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{job.duration}</span>
                      </>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 font-medium">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </>
                    )}
                  </div>

                  {job.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skillsRequired.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 bg-white/70 text-slate-700 rounded-lg text-xs font-medium border border-white/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="px-2.5 py-0.5 bg-white/60 text-slate-500 rounded-lg text-xs border border-white/50">
                          +{job.skillsRequired.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn-primary flex-1 px-4 py-2 text-sm text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => removeSavedJob(job.id)}
                    className="btn-secondary flex-1 px-4 py-2 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
