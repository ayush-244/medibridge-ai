import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole } from "@/lib/navigation";

export function HomeRedirect() {
  const { user } = useAuth();

  if (!user) return null;

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
