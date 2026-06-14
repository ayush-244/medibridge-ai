export { DashboardView } from "@/features/dashboard/components/DashboardView";
export { useDashboard } from "@/features/dashboard/hooks/useDashboard";
export { useActivities } from "@/features/dashboard/hooks/useActivities";
export { dashboardService } from "@/features/dashboard/services/dashboard.service";
export { activityService } from "@/features/dashboard/services/activity.service";
export type {
  DashboardStatsResponse,
  SuperAdminDashboardData,
  HospitalAdminDashboardData,
  KpiCardConfig,
  ActivityItem,
} from "@/features/dashboard/types/dashboard.types";
