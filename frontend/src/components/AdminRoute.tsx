import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
