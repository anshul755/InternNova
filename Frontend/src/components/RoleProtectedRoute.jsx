import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function RoleProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="w-6 h-6 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    // Redirect to the appropriate dashboard
    const redirect = user.role === "Company" ? "/dashboard/company" : "/dashboard/talent";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
