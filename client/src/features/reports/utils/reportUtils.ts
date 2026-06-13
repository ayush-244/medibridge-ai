import type {
  DoctorSummary,
  HospitalSummary,
  ReferralSummary,
} from "@/features/reports/types/report.types";

const CHART_COLORS = {
  primary: "#0EA5E9",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  secondary: "#64748B",
  purple: "#8B5CF6",
};

export function computeBedOccupancyRate(summary: HospitalSummary): string {
  if (summary.totalBeds === 0) return "0%";
  const occupied = summary.totalBeds - summary.availableBeds;
  return `${Math.round((occupied / summary.totalBeds) * 100)}%`;
}

export function computeIcuOccupancyRate(summary: HospitalSummary): string {
  if (summary.totalICUBeds === 0) return "0%";
  const occupied = summary.totalICUBeds - summary.availableICUBeds;
  return `${Math.round((occupied / summary.totalICUBeds) * 100)}%`;
}

export function buildDoctorChartData(doctor: DoctorSummary) {
  return [
    { name: "Available", value: doctor.availableDoctors, fill: CHART_COLORS.success },
    { name: "Busy", value: doctor.busyDoctors, fill: CHART_COLORS.warning },
    { name: "Off Duty", value: doctor.offDutyDoctors, fill: CHART_COLORS.secondary },
  ].filter((d) => d.value > 0);
}

export function buildReferralChartData(referral: ReferralSummary) {
  return [
    { name: "Accepted", value: referral.accepted, fill: CHART_COLORS.success },
    { name: "Pending", value: referral.pending, fill: CHART_COLORS.warning },
    { name: "Rejected", value: referral.rejected, fill: CHART_COLORS.danger },
    { name: "Completed", value: referral.completed, fill: CHART_COLORS.primary },
  ].filter((d) => d.value > 0);
}

export function buildBedChartData(hospital: HospitalSummary) {
  const occupiedBeds = hospital.totalBeds - hospital.availableBeds;
  const occupiedIcu = hospital.totalICUBeds - hospital.availableICUBeds;

  return [
    { name: "Available General", value: hospital.availableBeds, fill: CHART_COLORS.success },
    { name: "Occupied General", value: occupiedBeds, fill: CHART_COLORS.primary },
    { name: "Available ICU", value: hospital.availableICUBeds, fill: CHART_COLORS.purple },
    { name: "Occupied ICU", value: occupiedIcu, fill: CHART_COLORS.warning },
  ].filter((d) => d.value > 0);
}

export { CHART_COLORS };
