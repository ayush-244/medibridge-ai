import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ROLES } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

export function HomeRedirect() {
  const { user } = useAuth();

  if (user?.role === ROLES.DOCTOR) {
    return <Navigate to={ROUTES.DOCTOR_DASHBOARD} replace />;
  }

  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
