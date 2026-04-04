import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

const TalentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const profilePromise = api
        .get(`/talent/v1/${user.id}`)
        .then((res) => res.json())
        .catch((err) => {
          const isNotFound = String(err?.message || '').includes('404');
          if (isNotFound) return null;
          throw err;
        });

      const appsPromise = api
        .get(`/applications/v1/student/${user.id}?page=0&size=5&sortBy=appliedAt&sortDir=desc`)
        .then((res) => res.json());

      const jobsPromise = api
        .get('/jobs/v1?page=0&size=5&sortBy=createdAt&sortDir=desc')
        .then((res) => res.json());

      const [profileData, appsData, jobsData] = await Promise.all([
        profilePromise,
        appsPromise,
        jobsPromise,
      ]);

      setProfile(profileData);
      setApplications(Array.isArray(appsData) ? appsData : (appsData.content || []));
      setRecentJobs(Array.isArray(jobsData) ? jobsData : (jobsData.content || []));
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'text-yellow-400';
      case 'UNDER_REVIEW': return 'text-blue-400';
      case 'SHORTLISTED': return 'text-purple-400';
      case 'INTERVIEW': return 'text-indigo-400';
      case 'OFFER': return 'text-green-400';
      case 'HIRED': return 'text-teal-400';
      case 'REJECTED': return 'text-red-400';
      case 'WITHDRAWN': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-yellow-400/10';
      case 'UNDER_REVIEW': return 'bg-blue-400/10';
      case 'SHORTLISTED': return 'bg-purple-400/10';
      case 'INTERVIEW': return 'bg-indigo-400/10';
      case 'OFFER': return 'bg-green-400/10';
      case 'HIRED': return 'bg-teal-400/10';
      case 'REJECTED': return 'bg-red-400/10';
      case 'WITHDRAWN': return 'bg-gray-400/10';
      default: return 'bg-gray-400/10';
    }
  };

  const stats = {
    applied: applications.filter(a => a.status === 'APPLIED').length,
    inProgress: applications.filter(a => ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'].includes(a.status)).length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
    offers: applications.filter(a => ['OFFER', 'HIRED'].includes(a.status)).length,
    total: applications.length,
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
              <span className="text-slate-300">Talent Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">{user?.email}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
              {profile ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-slate-200">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">University</p>
                    <p className="text-slate-200">{profile.university}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Major</p>
                    <p className="text-slate-200">{profile.major}</p>
                  </div>
                  {profile.cgpa && (
                    <div>
                      <p className="text-xs text-slate-400">CGPA</p>
                      <p className="text-slate-200">{profile.cgpa}/10</p>
                    </div>
                  )}
                  {profile.skills?.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Profile not found. Please complete your profile.</p>
              )}
              <Link
                to="/profile/edit"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block text-center"
              >
                Edit Profile
              </Link>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Application Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{stats.applied}</p>
                  <p className="text-xs text-slate-400">Applied</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
                  <p className="text-xs text-slate-400">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{stats.offers}</p>
                  <p className="text-xs text-slate-400">Offers/Hired</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-200">{stats.total}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link to="/applications" className="text-sm text-blue-400 hover:text-blue-300">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {applications.length > 0 ? applications.map(app => (
                <div key={app.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-200 text-sm">{app.jobTitle}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBg(app.status)} ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{app.companyName}</p>
                  {app.appliedAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">No applications yet</p>
                  <Link
                    to="/jobs"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/jobs"
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-center text-white transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/applications"
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-slate-300 transition-colors"
                >
                  My Applications
                </Link>
                <Link
                  to="/saved-jobs"
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-slate-300 transition-colors"
                >
                  Saved Jobs
                </Link>
                <Link
                  to="/profile/edit"
                  className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-slate-300 transition-colors"
                >
                  Update Profile
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Job Posts</h2>
                <Link to="/jobs" className="text-sm text-blue-400 hover:text-blue-300">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentJobs.length > 0 ? recentJobs.map(job => (
                  <div key={job.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h3 className="font-medium text-slate-200 text-sm mb-1">{job.title}</h3>
                    <p className="text-xs text-slate-400">{job.location}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-slate-500">
                        {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : ''}
                      </span>
                      <Link to={`/jobs/${job.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                        View Details
                      </Link>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 text-sm text-center py-4">No jobs available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentDashboard;
