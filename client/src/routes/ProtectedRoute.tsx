import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/auth";
import type { UserRole } from "../model/auth";

interface ProtectedRouteProps {
  /** If provided, only these roles may access the nested routes. */
  allowedRoles?: UserRole[];
}

/**
 * Guards nested routes. Redirects unauthenticated users to /signin and
 * users without the required role to the dashboard.
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
