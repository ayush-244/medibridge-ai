import { Route, Routes } from "react-router-dom";
import { routeRoles } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { UnauthorizedPage } from "@/pages/auth/UnauthorizedPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { HospitalsPage } from "@/pages/hospitals/HospitalsPage";
import { DoctorsPage } from "@/pages/doctors/DoctorsPage";
import { ReferralsPage } from "@/pages/referrals/ReferralsPage";
import { ReservationsPage } from "@/pages/reservations/ReservationsPage";
import { ReportsPage } from "@/pages/reports/ReportsPage";
import { NotificationsPage } from "@/pages/notifications/NotificationsPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";
import { DoctorDashboardPage } from "@/pages/dashboard/DoctorDashboardPage";
import { MapsPage } from "@/pages/maps/MapsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { HomeRedirect } from "@/routes/HomeRedirect";

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.DASHBOARD]} />
              }
            >
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.DOCTOR_DASHBOARD]} />
              }
            >
              <Route
                path={ROUTES.DOCTOR_DASHBOARD}
                element={<DoctorDashboardPage />}
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.REFERRALS]} />
              }
            >
              <Route path={ROUTES.REFERRALS} element={<ReferralsPage />} />
              <Route
                path={ROUTES.REFERRALS_INBOUND}
                element={<ReferralsPage />}
              />
              <Route
                path={ROUTES.REFERRALS_OUTBOUND}
                element={<ReferralsPage />}
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.HOSPITALS]} />
              }
            >
              <Route path={ROUTES.HOSPITALS} element={<HospitalsPage />} />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={routeRoles[ROUTES.MAPS]} />}
            >
              <Route path={ROUTES.MAPS} element={<MapsPage />} />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={routeRoles[ROUTES.DOCTORS]} />}
            >
              <Route path={ROUTES.DOCTORS} element={<DoctorsPage />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.RESERVATIONS]} />
              }
            >
              <Route
                path={ROUTES.RESERVATIONS}
                element={<ReservationsPage />}
              />
            </Route>

            <Route
              element={<RoleRoute allowedRoles={routeRoles[ROUTES.REPORTS]} />}
            >
              <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.NOTIFICATIONS]} />
              }
            >
              <Route
                path={ROUTES.NOTIFICATIONS}
                element={<NotificationsPage />}
              />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.SETTINGS]} />
              }
            >
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.USERS]} />
              }
            >
              <Route path={ROUTES.USERS} element={<UsersPage />} />
            </Route>

            <Route
              element={
                <RoleRoute allowedRoles={routeRoles[ROUTES.AUDIT_LOGS]} />
              }
            >
              <Route
                path={ROUTES.AUDIT_LOGS}
                element={<AuditLogsPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
