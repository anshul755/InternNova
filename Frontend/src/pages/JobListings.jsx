import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';

const JOB_TYPES = ['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE'];

const JobListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isCompany = user?.role === 'Company';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (locationFilter.trim()) params.set('location', locationFilter.trim());
      if (typeFilter) params.set('jobType', typeFilter);

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
      setError(err.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, locationFilter, typeFilter]);

  useEffect(() => {
    const delay = setTimeout(() => { fetchJobs(); }, 400);
    return () => clearTimeout(delay);
  }, [fetchJobs]);

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setRemoteFilter('');
    setPage(0);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return '';
    if (min && max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max.toLocaleString()}`;
  };

  const formatPostedDate = (dateString) => {
    if (!dateString) return '';
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const filteredJobs = remoteFilter
    ? jobs.filter(j => remoteFilter === 'remote' ? j.remoteOption : !j.remoteOption)
    : jobs;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to={user ? (isCompany ? '/dashboard/company' : '/dashboard/talent') : '/'}
                className="text-xl font-bold text-blue-400"
              >
                InternNova
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Browse Jobs</span>
            </div>
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {isCompany && (
                    <Link
                      to="/jobs/create"
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Post a Job
                    </Link>
                  )}
                  <Link
                    to={isCompany ? '/dashboard/company' : '/dashboard/talent'}
                    className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Search</label>
              <input
                type="text"
                placeholder="Job title, skill..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
              <input
                type="text"
                placeholder="City, state..."
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setPage(0); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Job Type</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Work Style</label>
              <select
                value={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>
          {(searchTerm || locationFilter || typeFilter || remoteFilter) && (
            <div className="mt-3">
              <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300">
                Clear all filters
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {loading ? 'Loading...' : `${totalElements} Job${totalElements !== 1 ? 's' : ''} Found`}
            </h2>
            {isCompany && (
              <p className="text-sm text-amber-400 mt-1">
                You are viewing as a company — only talent can apply for jobs.
              </p>
            )}
          </div>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
            <button onClick={fetchJobs} className="ml-3 text-red-300 hover:text-red-200 underline text-sm">
              Retry
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800">
            <p className="text-slate-400 text-lg mb-2">No jobs found</p>
            <p className="text-slate-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors"
                      >
                        {job.title}
                      </Link>
                      {job.remoteOption && (
                        <span className="px-2 py-0.5 bg-green-400/10 text-green-400 rounded text-xs">Remote</span>
                      )}
                      {job.jobType && (
                        <span className="px-2 py-0.5 bg-blue-400/10 text-blue-400 rounded text-xs">
                          {job.jobType.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mb-3">
                      <span className="text-slate-300">{job.location}</span>
                      {job.duration && <><span className="text-slate-600">•</span><span>{job.duration}</span></>}
                      {(job.salaryMin || job.salaryMax) && (
                        <><span className="text-slate-600">•</span><span className="text-green-400">{formatSalary(job.salaryMin, job.salaryMax)}</span></>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{job.description}</p>
                    )}

                    {job.skillsRequired?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skillsRequired.slice(0, 6).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded text-xs">{skill}</span>
                        ))}
                        {job.skillsRequired.length > 6 && (
                          <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
                            +{job.skillsRequired.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{job.applicationsCount || 0} applicants</span>
                      {job.applicationDeadline && (
                        <><span className="text-slate-600">•</span>
                        <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span></>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {!isCompany && user && (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        Apply Now
                      </Link>
                    )}
                    {!user && (
                      <Link
                        to="/login"
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors text-center"
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
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
