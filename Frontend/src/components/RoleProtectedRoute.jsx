import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { FullPageLoader } from "./Skeleton.jsx";

export default function RoleProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    const redirect = user.role === "Company" ? "/dashboard/company" : "/dashboard/talent";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
