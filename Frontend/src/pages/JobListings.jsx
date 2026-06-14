import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { api } from "../lib/api";
import { JobListingsSkeleton } from "../components/Skeleton.jsx";
import ErrorState from "../components/ErrorState.jsx";
import GlassSelect from "../components/GlassSelect.jsx";

const JOB_TYPES = [
  "INTERNSHIP",
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
];

const CompanyAvatar = ({ companyName, logoUrl }) => {
  const [hasError, setHasError] = useState(false);
  const initials = (companyName || "Company")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-sm">
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={`${companyName || "Company"} logo`}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-sm font-semibold text-slate-700">
          {initials || "CO"}
        </span>
      )}
    </div>
  );
};

const JobListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompany = user?.role === "Company";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [remoteFilter, setRemoteFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [companiesById, setCompaniesById] = useState({});

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        sortBy: "createdAt",
        sortDir: "desc",
      });

      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (locationFilter.trim()) params.set("location", locationFilter.trim());
      if (typeFilter) params.set("jobType", typeFilter);

      const res = await api.get(`/jobs/v1?${params}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setJobs(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setJobs(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, locationFilter, typeFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchJobs();
    }, 400);
    return () => clearTimeout(delay);
  }, [fetchJobs]);

  useEffect(() => {
    const companyIds = [
      ...new Set(jobs.map((job) => job.companyId).filter(Boolean)),
    ];

    if (companyIds.length === 0) {
      setCompaniesById({});
      return;
    }

    let cancelled = false;

    const fetchCompanies = async () => {
      const entries = await Promise.all(
        companyIds.map(async (companyId) => {
          try {
            const res = await api.get(`/company/v1/${companyId}`);
            const data = await res.json();
            return [companyId, data];
          } catch {
            return [companyId, null];
          }
        }),
      );

      if (cancelled) return;

      const nextCompaniesById = {};
      entries.forEach(([companyId, company]) => {
        if (company) nextCompaniesById[companyId] = company;
      });
      setCompaniesById(nextCompaniesById);
    };

    fetchCompanies();

    return () => {
      cancelled = true;
    };
  }, [jobs]);

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setTypeFilter("");
    setRemoteFilter("");
    setPage(0);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return "";
    if (min && max)
      return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const filteredJobs = remoteFilter
    ? jobs.filter((job) =>
        remoteFilter === "remote" ? job.remoteOption : !job.remoteOption,
      )
    : jobs;

  const getCompanyName = (job) =>
    companiesById[job.companyId]?.companyName || job.companyName || "Company";

  const getCompanyLogoUrl = (job) =>
    companiesById[job.companyId]?.logoUrl ||
    job.companyLogoUrl ||
    job.logoUrl ||
    "";

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="glass-card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Job title, skill..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="input-glass text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="City, state..."
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setPage(0);
              }}
              className="input-glass text-sm"
            />
          </div>
          <div>
            <label
              id="job-type-filter-label"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Job Type
            </label>
            <GlassSelect
              label="Job Type"
              labelId="job-type-filter-label"
              value={typeFilter}
              onValueChange={(nextValue) => {
                setTypeFilter(nextValue);
                setPage(0);
              }}
              placeholder="All Types"
              clearLabel="All Types"
              options={JOB_TYPES.map((t) => ({
                value: t,
                label: t.replace("_", " "),
              }))}
            />
          </div>
          <div>
            <label
              id="work-style-filter-label"
              className="block text-xs font-medium text-slate-500 mb-1"
            >
              Work Style
            </label>
            <GlassSelect
              label="Work Style"
              labelId="work-style-filter-label"
              value={remoteFilter}
              onValueChange={(nextValue) => setRemoteFilter(nextValue)}
              placeholder="All"
              clearLabel="All"
              options={[
                { value: "remote", label: "Remote" },
                { value: "onsite", label: "On-site" },
              ]}
            />
          </div>
        </div>

        {(searchTerm || locationFilter || typeFilter || remoteFilter) && (
          <div className="mt-3">
            <button
              onClick={clearFilters}
              className="text-xs text-slate-700 hover:text-slate-900 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {loading
              ? "Loading..."
              : `${totalElements} Job${totalElements !== 1 ? "s" : ""} Found`}
          </h2>
          {isCompany && (
            <p className="text-sm text-amber-600 mt-1">
              You are viewing as a company — only talent can apply for jobs.
            </p>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchJobs} />}

      {loading ? (
        <JobListingsSkeleton />
      ) : filteredJobs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No jobs found</p>
          <p className="text-slate-400 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="glass-card p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <CompanyAvatar
                    companyName={getCompanyName(job)}
                    logoUrl={getCompanyLogoUrl(job)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="block text-xl font-semibold text-slate-900 hover:text-slate-950 transition-colors truncate"
                    >
                      {job.title}
                    </Link>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">
                        {getCompanyName(job)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>{job.location || "Location not specified"}</span>
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

                    {job.description && (
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 line-clamp-3">
                        {job.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 lg:w-40">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn-primary px-4 py-2 text-sm text-center"
                  >
                    View Details
                  </Link>
                  {!isCompany && user && (
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn-secondary px-4 py-2 text-sm text-center"
                    >
                      Apply Now
                    </Link>
                  )}
                  {!user && (
                    <Link
                      to="/login"
                      className="btn-secondary px-4 py-2 text-sm text-center"
                    >
                      Sign In to Apply
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-500 text-sm">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListings;
