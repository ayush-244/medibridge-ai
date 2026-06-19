import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";

export function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.mustChangePassword) {
    return <Navigate to={ROUTES.CHANGE_PASSWORD} replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
