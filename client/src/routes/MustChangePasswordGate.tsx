import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";

export function MustChangePasswordGate() {
  const { mustChangePassword } = useAuth();
  const location = useLocation();

  if (
    mustChangePassword &&
    location.pathname !== ROUTES.CHANGE_PASSWORD
  ) {
    return (
      <Navigate to={ROUTES.CHANGE_PASSWORD} replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
