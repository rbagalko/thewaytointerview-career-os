import { Navigate, Outlet, useLocation } from "react-router-dom";
import { RouteFallback } from "@/components/RouteFallback";
import { useAuth } from "@/app/auth/AuthProvider";

export function RequireAuth() {
  const location = useLocation();
  const { isConfigured, isLoading, user } = useAuth();

  if (!isConfigured) {
    return <Outlet />;
  }

  if (isLoading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

