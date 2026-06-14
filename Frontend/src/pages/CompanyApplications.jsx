import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { CompanyApplicationsSkeleton } from "../components/Skeleton.jsx";
import GlassSelect from "../components/GlassSelect.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAlert } from "../lib/AlertContext.jsx";

const PIPELINE_STAGES = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "REJECTED",
];

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

      if (
        routeJobId &&
        list.some((job) => String(job.id) === String(routeJobId))
      ) {
        setSelectedJobId(String(routeJobId));
      } else {
        setSelectedJobId((prev) => prev || String(list[0].id));
      }
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
    if (loadingApps) {
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
        <div className="glass-card p-4 sm:p-5">
          <div className="grid gap-4 xl:grid-cols-4">
            {PIPELINE_STAGES.map((stage) => {
              const appsInStage = applications.filter(
                (a) => a.status === stage,
              );
              const isApplied = stage === "APPLIED";
              const stagePosition = "";
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
                  className={`glass-card flex flex-col overflow-hidden transition-all ${stagePosition} min-h-[400px] xl:min-h-[560px] ${
                    dragOverStage === stage
                      ? "ring-2 ring-emerald-300 shadow-lg shadow-emerald-200/40"
                      : ""
                  }`}
                >
                  <div className="p-3 border-b border-white/40 flex justify-between items-center bg-white/60 rounded-t-xl">
                    <span className="font-semibold text-sm text-slate-700">
                      {stage.replace("_", " ")}
                    </span>
                    <span className="px-2 py-0.5 bg-white/70 rounded-full text-xs text-slate-600 border border-white/60">
                      {appsInStage.length}
                    </span>
                  </div>
                  <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[28rem] xl:max-h-[32rem]">
                    {appsInStage.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-400 italic">
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
                          className={`bg-white/70 border border-white/60 rounded-lg p-4 hover:border-white/80 transition-colors relative group cursor-grab active:cursor-grabbing ${draggedApplicationId === String(app.id) ? "opacity-60" : ""}`}
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
                          <p className="mt-2 text-[0.7rem] text-slate-400">
                            Drag this card to another column to change status.
                          </p>
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
        <div className="glass-card p-4 mb-6">
          <label
            htmlFor="job-select"
            className="text-xs font-medium text-slate-500 block mb-2"
          >
            Select Job
          </label>
          <GlassSelect
            label="Select Job"
            value={selectedJobId}
            onValueChange={(nextValue) => {
              setSelectedJobId(nextValue);
              setPage(0);
            }}
            placeholder="Select Job"
            clearLabel="Select Job"
            showClearOption={false}
            className="w-full sm:w-[420px]"
            options={jobs.map((job) => ({
              value: String(job.id),
              label: `${job.title} • ${job.location}`,
            }))}
          />
        </div>

        {selectedJob && (
          <div className="glass-card p-5 mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedJob.title}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {selectedJob.location} •{" "}
              {selectedJob.jobType?.replace("_", " ") || "—"}
            </p>
          </div>
        )}

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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Manage Applications
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-rose-200 text-rose-600 bg-rose-50">
          {error}
        </div>
      )}

      {jobsContent}
    </div>
  );
}
