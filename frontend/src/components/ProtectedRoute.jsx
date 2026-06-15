import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { FullPageLoader } from "./Skeleton.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
