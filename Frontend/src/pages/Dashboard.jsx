import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";
import { useEffect } from "react";
import { FullPageLoader } from "../components/Skeleton.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? "Talent";

  useEffect(() => {
    if (user) {
      if (role === "Company") {
        navigate("/dashboard/company", { replace: true });
      } else {
        navigate("/dashboard/talent", { replace: true });
      }
    }
  }, [user, role, navigate]);

  return <FullPageLoader />;
}
