import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobFilter, setJobFilter] = useState('ALL');

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const companyPromise = api
        .get(`/company/v1/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          if (String(err?.message || '').includes('404')) return null;
          throw err;
        });

      const jobsPromise = api
        .get(`/jobs/v1/company/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          if (String(err?.message || '').includes('404')) return [];
          throw err;
        });

      const [companyData, jobsData] = await Promise.all([
        companyPromise,
        jobsPromise,
      ]);

      setCompany(companyData);
      const jobList = Array.isArray(jobsData) ? jobsData : (jobsData.content || []);
      setJobs(jobList);

      // Fetch recent applications for the most recent job
      if (jobList.length > 0) {
        try {
          const appsRes = await api.get(`/applications/v1/job/${jobList[0].id}?page=0&size=5&sortBy=appliedAt&sortDir=desc`);
          const appsData = await appsRes.json();
          setRecentApplications(Array.isArray(appsData) ? appsData : (appsData.content || []));
        } catch {
          setRecentApplications([]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/v1/${jobId}`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    if (!confirm(`Are you sure you want to change this job's status to ${newStatus}?`)) return;
    try {
      const res = await api.put(`/jobs/v1/${jobId}`, { status: newStatus });
      const updatedJob = await res.json();
      setJobs(prev => prev.map(j => j.id === jobId ? updatedJob : j));
    } catch (err) {
      alert(err.message || `Failed to update job status to ${newStatus}`);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      APPLIED: 'text-yellow-400',
      UNDER_REVIEW: 'text-blue-400',
      SHORTLISTED: 'text-purple-400',
      INTERVIEW: 'text-indigo-400',
      OFFER: 'text-green-400',
      HIRED: 'text-teal-400',
      REJECTED: 'text-red-400',
      DRAFT: 'text-gray-400',
      ACTIVE: 'text-green-400',
      CLOSED: 'text-orange-400',
      ARCHIVED: 'text-gray-600',
      WITHDRAWN: 'text-gray-400',
    };
    return map[status] || 'text-gray-400';
  };

  const getStatusBg = (status) => {
    const map = {
      APPLIED: 'bg-yellow-400/10',
      UNDER_REVIEW: 'bg-blue-400/10',
      SHORTLISTED: 'bg-purple-400/10',
      INTERVIEW: 'bg-indigo-400/10',
      OFFER: 'bg-green-400/10',
      HIRED: 'bg-teal-400/10',
      REJECTED: 'bg-red-400/10',
      DRAFT: 'bg-gray-400/10',
      ACTIVE: 'bg-green-400/10',
      CLOSED: 'bg-orange-400/10',
      ARCHIVED: 'bg-gray-600/10',
      WITHDRAWN: 'bg-gray-400/10',
    };
    return map[status] || 'bg-gray-400/10';
  };

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
    totalApplications: jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-400">InternNova</h1>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Company Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">{company?.companyName || user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm text-slate-400 mb-2">Total Jobs Posted</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.totalJobs}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm text-slate-400 mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-green-400">{stats.activeJobs}</p>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h3 className="text-sm text-slate-400 mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.totalApplications}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Company Profile</h2>
              {company ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Company Name</p>
                    <p className="text-slate-200">{company.companyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Company Size</p>
                    <p className="text-slate-200">{company.companySize} employees</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Industry</p>
                    <p className="text-slate-200">{company.companyType}</p>
                  </div>
                  {company.foundedYear && (
                    <div>
                      <p className="text-xs text-slate-400">Founded</p>
                      <p className="text-slate-200">{company.foundedYear}</p>
                    </div>
                  )}
                  {company.websiteUrl && (
                    <div>
                      <p className="text-xs text-slate-400">Website</p>
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {company.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Profile not found.</p>
              )}
              <Link
                to="/company/profile/edit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block text-center"
              >
                Edit Profile
              </Link>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/jobs/create"
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center text-white transition-colors font-medium"
                >
                  Post New Job
                </Link>
                <Link
                  to="/company/applications"
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-slate-300 transition-colors"
                >
                  Review Applications
                </Link>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold whitespace-nowrap">Your Job Postings</h2>
              <div className="flex flex-wrap gap-2 bg-slate-800 p-1 rounded-lg">
                {['ALL', 'DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setJobFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${jobFilter === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {jobs.filter(j => jobFilter === 'ALL' || j.status === jobFilter).length > 0 ? 
                jobs.filter(j => jobFilter === 'ALL' || j.status === jobFilter).map(job => (
                  <div key={job.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-200 text-sm">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBg(job.status)} ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{job.location}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 mb-3">
                    <span>{job.applicationsCount || 0} applications</span>
                    <span>•</span>
                    <span>{job.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      to={`/jobs/${job.id}/applications`}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Applications
                    </Link>
                    <span className="text-slate-600">•</span>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="text-xs text-slate-400 hover:text-slate-300"
                    >
                      Edit
                    </Link>
                    {(!job.applicationsCount || job.applicationsCount === 0) && job.status !== 'ARCHIVED' && (
                      <>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {job.status === 'ACTIVE' && (
                      <>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'CLOSED')}
                          className="text-xs text-orange-400 hover:text-orange-300"
                        >
                          Close
                        </button>
                      </>
                    )}
                    {job.status === 'DRAFT' && (
                      <>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'ACTIVE')}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Publish
                        </button>
                      </>
                    )}
                    {job.status === 'CLOSED' && (
                      <>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'ARCHIVED')}
                          className="text-xs text-gray-400 hover:text-gray-300"
                        >
                          Archive
                        </button>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'ACTIVE')}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Reopen
                        </button>
                      </>
                    )}
                    {job.status === 'ARCHIVED' && (
                      <>
                        <span className="text-slate-600">•</span>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'ACTIVE')}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Reopen
                        </button>
                        {(!job.applicationsCount || job.applicationsCount === 0) && (
                          <>
                            <span className="text-slate-600">•</span>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No job postings yet</p>
                  <Link
                    to="/jobs/create"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link
                to="/company/applications"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentApplications.length > 0 ? recentApplications.map(app => (
                <div key={app.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium text-slate-200 text-sm">{app.studentName || 'Applicant'}</h3>
                      <p className="text-xs text-slate-400">{app.jobTitle}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBg(app.status)} ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  {app.aiMatchScore != null && (
                    <p className="text-xs text-slate-500 mt-2">
                      Match score: <span className="text-green-400 font-medium">{app.aiMatchScore}%</span>
                    </p>
                  )}
                  {app.appliedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                  <Link
                    to={`/applications/${app.id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                  >
                    Review
                  </Link>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No applications yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
