import { useEffect } from "react";
import { Navigate, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import CompanyRegister from "./pages/CompanyRegister.jsx";
import TalentRegister from "./pages/TalentRegister.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import JobListings from "./pages/JobListings.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import ApplicationManagement from "./pages/ApplicationManagement.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import TalentDashboard from "./pages/TalentDashboard.jsx";
import CompanyDashboard from "./pages/CompanyDashboard.jsx";
import CompanyApplications from "./pages/CompanyApplications.jsx";
import PostJob from "./pages/PostJob.jsx";
import TalentProfileEdit from "./pages/TalentProfileEdit.jsx";
import CompanyProfileEdit from "./pages/CompanyProfileEdit.jsx";
import JobEdit from "./pages/JobEdit.jsx";
import SavedJobs from "./pages/SavedJobs.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
import { getPostLoginRoute, useAuth } from "./lib/AuthContext.jsx";

function ModalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const path = location.pathname;

  let modalType = null;
  if (path === "/login") {
    modalType = "login";
  } else if (path === "/register/user" || path === "/register/talent") {
    modalType = "talent";
  } else if (path === "/register/company") {
    modalType = "company";
  }

  useEffect(() => {
    if (modalType) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalType]);

  const handleClose = () => {
    navigate("/");
  };

  if (!loading && user && modalType) {
    return <Navigate to={getPostLoginRoute(user.role)} replace />;
  }

  return (
    <div className="min-h-screen relative">
      <Landing />

      {modalType && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar px-4 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-6 top-6 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 border border-slate-600 text-slate-200 text-base shadow-sm backdrop-blur-md hover:bg-slate-800 hover:text-white hover:border-slate-400 transition-colors"
              aria-label="Close"
            >
              <IoClose className="h-5 w-5" />
            </button>

            {modalType === "login" && <Login modal />}
            {modalType === "talent" && <TalentRegister modal />}
            {modalType === "company" && <CompanyRegister modal />}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/talent"
        element={
          <RoleProtectedRoute role="Talent">
            <TalentDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard/company"
        element={
          <RoleProtectedRoute role="Company">
            <CompanyDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route path="/jobs" element={<JobListings />} />
      <Route
        path="/jobs/create"
        element={
          <RoleProtectedRoute role="Company">
            <PostJob />
          </RoleProtectedRoute>
        }
      />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route
        path="/jobs/:id/edit"
        element={
          <RoleProtectedRoute role="Company">
            <JobEdit />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id/applications"
        element={
          <RoleProtectedRoute role="Company">
            <CompanyApplications />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/company/applications"
        element={
          <RoleProtectedRoute role="Company">
            <CompanyApplications />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <RoleProtectedRoute role="Talent">
            <ApplicationManagement />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/applications/:id"
        element={
          <ProtectedRoute>
            <ApplicationDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <RoleProtectedRoute role="Talent">
            <SavedJobs />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <RoleProtectedRoute role="Talent">
            <TalentProfileEdit />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/company/profile/edit"
        element={
          <RoleProtectedRoute role="Company">
            <CompanyProfileEdit />
          </RoleProtectedRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/*" element={<ModalLayout />} />
    </Routes>
  );
}

export default App;
