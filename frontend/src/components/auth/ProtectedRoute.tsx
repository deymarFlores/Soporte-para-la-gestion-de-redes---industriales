import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import type { Role } from "../../types/auth.js";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
