import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { CompanyApplicationsSkeleton } from "../components/Skeleton.jsx";
import GlassSelect from "../components/GlassSelect.jsx";
import SearchableSelect from "../components/SearchableSelect.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAlert } from "../lib/AlertContext.jsx";
import FormErrorBanner from "../components/FormErrorBanner.jsx";

const PIPELINE_STAGES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

const STAGE_STYLES = {
  APPLIED: {
    header: "bg-sky-50 text-sky-900 border-sky-100",
    dot: "bg-sky-500",
  },
  UNDER_REVIEW: {
    header: "bg-amber-50 text-amber-900 border-amber-100",
    dot: "bg-amber-500",
  },
  SHORTLISTED: {
    header: "bg-emerald-50 text-emerald-900 border-emerald-100",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    header: "bg-rose-50 text-rose-900 border-rose-100",
    dot: "bg-rose-500",
  },
};

export default function CompanyApplications() {
  const { user } = useAuth();
  const { id: routeJobId } = useParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(routeJobId || "");
  const [applications, setApplications] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState("");
  const [draggedApplicationId, setDraggedApplicationId] = useState("");
  const [dragOverStage, setDragOverStage] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    if (!user?.id) return;
    loadJobs();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedJobId) return;
    loadApplications();
  }, [selectedJobId, page]);

  async function loadJobs() {
    setLoadingJobs(true);
    setError("");
    try {
      const res = await api.get(`/jobs/v1/company/${user.id}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.content || [];
      setJobs(list);

      if (list.length === 0) {
        setSelectedJobId("");
        return;
      }

      // If navigated directly via route (/applications/job/:id), select that job.
      if (
        routeJobId &&
        list.some((job) => String(job.id) === String(routeJobId))
      ) {
        setSelectedJobId(String(routeJobId));
      }
      // Otherwise: no default selection — user picks via searchable dropdown.
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }

  async function loadApplications() {
    setLoadingApps(true);
    setError("");
    try {
      const res = await api.get(
        `/applications/v1/job/${selectedJobId}?page=-1&size=-1`,
      );
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : data.content || []);
      setTotalPages(1);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || "Failed to load applications");
    } finally {
      setLoadingApps(false);
    }
  }

  async function updateStatus(applicationId, newStatus) {
    const currentApplication = applications.find(
      (app) => String(app.id) === String(applicationId),
    );

    if (!currentApplication || currentApplication.status === newStatus) {
      return;
    }

    const previousApplications = applications;
    setUpdatingId(applicationId);
    try {
      setApplications((prev) =>
        prev.map((app) =>
          String(app.id) === String(applicationId)
            ? { ...app, status: newStatus }
            : app,
        ),
      );

      await api.put(`/applications/v1/${applicationId}/status`, {
        status: newStatus,
        recruiterNotes: "",
      });
    } catch (err) {
      setApplications(previousApplications);
      await showAlert(err.message || "Failed to update application status");
    } finally {
      setUpdatingId("");
    }
  }

  function handleDragStart(applicationId) {
    setDraggedApplicationId(String(applicationId));
  }

  function handleDragEnd() {
    setDraggedApplicationId("");
    setDragOverStage("");
  }

  function handleDrop(applicationId, nextStatus) {
    setDragOverStage("");
    setDraggedApplicationId("");
    updateStatus(applicationId, nextStatus);
  }

  const selectedJob = jobs.find(
    (job) => String(job.id) === String(selectedJobId),
  );

  let jobsContent;
  if (loadingJobs) {
    jobsContent = (
      <CompanyApplicationsSkeleton />
    );
  } else if (jobs.length === 0) {
    jobsContent = (
      <div className="glass-card p-10 text-center">
        <p className="text-slate-500 mb-4">No jobs posted yet.</p>
        <Link
          to="/jobs/create"
          className="btn-primary px-5 py-2.5 text-sm font-medium"
        >
          Post your first job
        </Link>
      </div>
    );
  } else {
    let applicationsContent;
    if (!selectedJobId) {
      applicationsContent = (
        <div className="glass-card p-14 text-center">
          <p className="text-slate-400 text-lg mb-2">👆 Select a job above</p>
          <p className="text-slate-400 text-sm">
            Choose a job from the dropdown to view its applications.
          </p>
        </div>
      );
    } else if (loadingApps) {
      applicationsContent = (
        <CompanyApplicationsSkeleton />
      );
    } else if (applications.length === 0) {
      applicationsContent = (
        <div className="glass-card p-10 text-center text-slate-500">
          No applications for this job yet.
        </div>
      );
    } else {
      applicationsContent = (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.10)] sm:p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-4 xl:grid-cols-4">
            {PIPELINE_STAGES.map((stage) => {
              const appsInStage = applications.filter(
                (a) => a.status === stage,
              );
              const stageStyle = STAGE_STYLES[stage];
              return (
                <div
                  key={stage}
                  onDragOver={(event) => event.preventDefault()}
                  onDragEnter={() => setDragOverStage(stage)}
                  onDragLeave={() =>
                    setDragOverStage((current) =>
                      current === stage ? "" : current,
                    )
                  }
                  onDrop={(event) => {
                    event.preventDefault();
                    const applicationId =
                      event.dataTransfer.getData("text/plain");
                    if (applicationId) {
                      handleDrop(applicationId, stage);
                    }
                  }}
                  className={`flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 shadow-sm transition-all dark:border-white/10 dark:bg-white/[0.035] ${
                    dragOverStage === stage
                      ? "ring-2 ring-emerald-300 shadow-lg shadow-emerald-200/40"
                      : ""
                  }`}
                >
                  <div className={`border-b p-3 ${stageStyle.header}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${stageStyle.dot}`} />
                        <span className="font-semibold text-sm">
                          {stage.replace("_", " ")}
                        </span>
                      </div>
                      <span className="rounded-full border border-white/70 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {appsInStage.length}
                      </span>
                    </div>
                  </div>
                  <div className="company-stage-scroll flex-1 space-y-3 overflow-y-auto p-3">
                    {appsInStage.length === 0 ? (
                      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 text-center text-xs italic text-slate-400 dark:border-white/10 dark:bg-white/[0.03]">
                        No candidates
                      </div>
                    ) : (
                      appsInStage.map((app) => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData(
                              "text/plain",
                              String(app.id),
                            );
                            handleDragStart(app.id);
                          }}
                          onDragEnd={handleDragEnd}
                          className={`relative rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-colors hover:border-emerald-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)] cursor-grab active:cursor-grabbing dark:border-white/10 dark:bg-white/[0.055] ${draggedApplicationId === String(app.id) ? "opacity-60" : ""}`}
                        >
                          <Link
                            to={`/applications/${app.id}`}
                            className="block"
                          >
                            <h3 className="font-semibold text-sm text-slate-900 hover:text-slate-950 truncate pr-6">
                              {app.studentName || `Candidate #${app.studentId}`}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              Applied{" "}
                              {new Date(
                                app.appliedAt || app.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </Link>
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-2 text-xs text-slate-700 hover:text-slate-900 font-medium"
                            >
                              Resume
                            </a>
                          )}
                          <GlassSelect
                            label={`Update status for ${app.studentName || `Candidate #${app.studentId}`}`}
                            value={app.status}
                            onValueChange={(nextValue) =>
                              updateStatus(app.id, nextValue)
                            }
                            disabled={updatingId === app.id}
                            placeholder="Update status"
                            clearLabel="Update status"
                            showClearOption={false}
                            className="mt-3"
                            options={PIPELINE_STAGES.map((s) => ({
                              value: s,
                              label: s.replace("_", " "),
                            }))}
                          />
                          <p className="mt-2 text-[0.7rem] text-slate-500">
                            Drag this card to another column to change status.
                          </p>
                          {app.status === "APPLIED" && app.evaluationAttemptedAt == null && (
                            <p className="mt-1 text-[0.7rem] text-amber-600 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                              AI evaluation pending…
                            </p>
                          )}
                          {app.evaluationError && (
                            <p className="mt-1 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 text-[0.7rem] text-rose-600" title={app.evaluationError}>
                              AI evaluation needs manual review
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    jobsContent = (
      <>
        <div className="glass-card p-5 mb-6">
          <SearchableSelect
            label="Select Job"
            value={selectedJobId}
            onChange={(nextValue) => {
              setSelectedJobId(nextValue);
              setPage(0);
            }}
            placeholder="Select a job to view applications..."
            emptyMessage="No matching jobs found."
            className="w-full sm:w-[420px]"
            options={jobs.map((job) => ({
              value: String(job.id),
              label: job.title,
              sublabel: `${job.location}${job.jobType ? ` · ${job.jobType.replace(/_/g, " ")}` : ""}`,
            }))}
          />
          {selectedJobId && selectedJob && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06]">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {selectedJob.title}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {selectedJob.location}
              </span>
              {selectedJob.jobType && (
                <>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedJob.jobType.replace(/_/g, " ")}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {applicationsContent}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
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
      </>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Applications
        </h1>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-400">
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => loadApplications()}
            disabled={loadingApps}
            className="btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1"
          >
            <span className={loadingApps ? "animate-spin" : ""}>↻</span>
            Refresh
          </button>
        </div>
      </div>

      <FormErrorBanner
        message={error}
        onDismiss={() => setError("")}
      />

      {jobsContent}
    </div>
  );
}
