import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/constants";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
