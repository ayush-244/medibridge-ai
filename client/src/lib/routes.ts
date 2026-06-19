export const ROUTES = {
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
  DASHBOARD: "/dashboard",
  DOCTOR_DASHBOARD: "/doctor-dashboard",
  REFERRALS: "/referrals",
  REFERRALS_INBOUND: "/referrals/inbound",
  REFERRALS_OUTBOUND: "/referrals/outbound",
  HOSPITALS: "/hospitals",
  DOCTORS: "/doctors",
  RESERVATIONS: "/reservations",
  REPORTS: "/reports",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  USERS: "/users",
  AUDIT_LOGS: "/admin/audit-logs",
  MAPS: "/maps",
  AI_RECOMMENDATIONS: "/ai-recommendations",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
