import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const RegisterChoice = lazy(() => import("./pages/RegisterChoice.jsx"));
const JobListings = lazy(() => import("./pages/JobListings.jsx"));
const JobDetails = lazy(() => import("./pages/JobDetails.jsx"));
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute.jsx";
const CompanyRegister = lazy(() => import("./pages/CompanyRegister.jsx"));
const TalentRegister = lazy(() => import("./pages/TalentRegister.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const TalentDashboard = lazy(() => import("./pages/TalentDashboard.jsx"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard.jsx"));
const CompanyJobs = lazy(() => import("./pages/CompanyJobs.jsx"));
const CompanyApplications = lazy(() => import("./pages/CompanyApplications.jsx"));
const PostJob = lazy(() => import("./pages/PostJob.jsx"));
const JobEdit = lazy(() => import("./pages/JobEdit.jsx"));
const ApplicationManagement = lazy(() => import("./pages/ApplicationManagement.jsx"));
const ApplicationDetail = lazy(() => import("./pages/ApplicationDetail.jsx"));
const SavedJobs = lazy(() => import("./pages/SavedJobs.jsx"));
const TalentProfile = lazy(() => import("./pages/TalentProfile.jsx"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile.jsx"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail.jsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.jsx"));
const LegalPrivacyPage = lazy(() => import("./pages/LegalPrivacyPage.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));
const ResumeGenerator = lazy(() => import("./pages/ResumeGenerator.jsx"));
import ToastContainer from "./components/ToastContainer.jsx";

function App() {
  return (
    <>
      <ScrollToTop />
      <ToastContainer />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/user" element={<TalentRegister />} />
          <Route path="/register/talent" element={<TalentRegister />} />
          <Route path="/register/company" element={<CompanyRegister />} />

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
          <Route
            path="/company/jobs"
            element={
              <RoleProtectedRoute role="Company">
                <CompanyJobs />
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
            path="/profile"
            element={
              <RoleProtectedRoute role="Talent">
                <TalentProfile />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/resume-generator"
            element={
              <RoleProtectedRoute role="Talent">
                <ResumeGenerator />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <RoleProtectedRoute role="Company">
                <CompanyProfile />
              </RoleProtectedRoute>
            }
          />

          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/privacy-policy" element={<LegalPrivacyPage />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
