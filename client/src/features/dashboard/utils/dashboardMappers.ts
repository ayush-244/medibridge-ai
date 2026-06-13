import {
  Building2,
  Stethoscope,
  BedDouble,
  FileText,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  isHospitalAdminData,
  isSuperAdminData,
  type DashboardStatsResponse,
  type KpiCardConfig,
  type MetricItem,
} from "@/features/dashboard/types/dashboard.types";

export interface KpiCardWithIcon extends KpiCardConfig {
  icon: LucideIcon;
}

export function buildKpiCards(stats: DashboardStatsResponse): KpiCardWithIcon[] {
  const { role, data } = stats;

  if (isSuperAdminData(role, data)) {
    const bedUtilization =
      data.totalBeds > 0
        ? Math.round(
            ((data.totalBeds - data.availableBeds) / data.totalBeds) * 100,
          )
        : 0;

    return [
      {
        title: "Total Hospitals",
        value: data.totalHospitals,
        icon: Building2,
        description: "Across the network",
      },
      {
        title: "Total Doctors",
        value: data.totalDoctors,
        icon: Stethoscope,
        description: "Registered physicians",
      },
      {
        title: "Available Beds",
        value: data.availableBeds,
        icon: BedDouble,
        description: `${bedUtilization}% utilization`,
        trend: {
          value: `${data.totalBeds} total`,
        },
      },
      {
        title: "Active Referrals",
        value: data.totalReferrals,
        icon: FileText,
        description: `${data.activeReservations} active reservations`,
      },
    ];
  }

  if (isHospitalAdminData(role, data)) {
    return [
      {
        title: "Total Doctors",
        value: data.totalDoctors,
        icon: Stethoscope,
        description: `${data.availableDoctors} available`,
      },
      {
        title: "Available Beds",
        value: data.availableBeds,
        icon: BedDouble,
        description: `${data.availableICUBeds} ICU beds free`,
      },
      {
        title: "Pending Referrals",
        value: data.pendingReferrals,
        icon: FileText,
        description: `${data.acceptedReferrals} accepted`,
        trend: {
          value: `${data.totalReferrals} total`,
        },
      },
      {
        title: "Active Reservations",
        value: data.activeReservations,
        icon: Activity,
        description: "Confirmed bed holds",
      },
    ];
  }

  return [];
}

export function buildOperationalMetrics(
  stats: DashboardStatsResponse,
): MetricItem[] {
  const { role, data } = stats;

  if (isSuperAdminData(role, data)) {
    return [
      { label: "Total Beds", value: data.totalBeds },
      { label: "Occupied Beds", value: data.totalBeds - data.availableBeds },
      {
        label: "Active Reservations",
        value: data.activeReservations,
        highlight: true,
      },
      { label: "Total Referrals", value: data.totalReferrals },
    ];
  }

  if (isHospitalAdminData(role, data)) {
    return [
      { label: "Available Doctors", value: data.availableDoctors },
      { label: "Busy Doctors", value: data.busyDoctors },
      { label: "Accepted Referrals", value: data.acceptedReferrals, highlight: true },
      { label: "Pending Referrals", value: data.pendingReferrals },
    ];
  }

  return [];
}

export function buildSystemOverview(
  stats: DashboardStatsResponse,
): MetricItem[] {
  const { role, data, hospital } = stats;

  if (isSuperAdminData(role, data)) {
    const utilization =
      data.totalBeds > 0
        ? `${Math.round(((data.totalBeds - data.availableBeds) / data.totalBeds) * 100)}%`
        : "0%";

    return [
      { label: "Network Hospitals", value: data.totalHospitals },
      { label: "Bed Utilization", value: utilization, highlight: true },
      { label: "Available Beds", value: data.availableBeds },
      { label: "Active Reservations", value: data.activeReservations },
    ];
  }

  if (isHospitalAdminData(role, data)) {
    return [
      { label: "Hospital", value: hospital || "—" },
      { label: "Total Doctors", value: data.totalDoctors },
      { label: "ICU Beds Available", value: data.availableICUBeds, highlight: true },
      { label: "Total Referrals", value: data.totalReferrals },
    ];
  }

  return [];
}
