import type { UserRole } from "@/lib/constants";

export type DashboardApiRole = "SUPER_ADMIN" | "HOSPITAL_ADMIN";

export interface SuperAdminDashboardData {
  totalHospitals: number;
  totalDoctors: number;
  totalBeds: number;
  availableBeds: number;
  activeReservations: number;
  totalReferrals: number;
}

export interface HospitalAdminDashboardData {
  totalDoctors: number;
  availableDoctors: number;
  busyDoctors: number;
  totalReferrals: number;
  acceptedReferrals: number;
  pendingReferrals: number;
  activeReservations: number;
  availableBeds: number;
  availableICUBeds: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  role: DashboardApiRole;
  hospital?: string;
  data: SuperAdminDashboardData | HospitalAdminDashboardData;
}

export interface KpiCardConfig {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export interface MetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: "referral" | "reservation" | "doctor" | "system";
}

export function isSuperAdminData(
  role: DashboardApiRole,
  _data: SuperAdminDashboardData | HospitalAdminDashboardData,
): _data is SuperAdminDashboardData {
  return role === "SUPER_ADMIN";
}

export function isHospitalAdminData(
  role: DashboardApiRole,
  _data: SuperAdminDashboardData | HospitalAdminDashboardData,
): _data is HospitalAdminDashboardData {
  return role === "HOSPITAL_ADMIN";
}

export function supportsDashboardApi(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN";
}
