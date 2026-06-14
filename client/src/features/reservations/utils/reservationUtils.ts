import type { BedType, ReservationStatus } from "@/lib/constants";
import type {
  Reservation,
  ReservationFilters,
  ReservationSummary,
} from "@/features/reservations/types/reservation.types";

export function getDoctorName(doctor: Reservation["doctor"]): string {
  if (typeof doctor === "string") return doctor;
  return doctor.name;
}

export function getDoctorSpecialization(doctor: Reservation["doctor"]): string {
  if (typeof doctor === "string") return "";
  return doctor.specialization;
}

export function getHospitalName(hospital: Reservation["hospital"]): string {
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

export function getHospitalCity(hospital: Reservation["hospital"]): string {
  if (typeof hospital === "string") return "";
  return hospital.city;
}

export function getReferralPatient(referral: Reservation["referral"]): string {
  if (typeof referral === "string") return "—";
  return referral.patientName;
}

export function formatReservationDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getExpiryCountdown(
  expiresAt: string,
  status: ReservationStatus,
  now: number,
): { label: string; isExpired: boolean; isUrgent: boolean } {
  if (status === "EXPIRED") {
    return { label: "Expired", isExpired: true, isUrgent: false };
  }

  if (status !== "CONFIRMED" && status !== "PENDING" && status !== "ARRIVED") {
    return { label: formatReservationDate(expiresAt), isExpired: false, isUrgent: false };
  }

  const diff = new Date(expiresAt).getTime() - now;

  if (diff <= 0) {
    return { label: "Expired", isExpired: true, isUrgent: false };
  }

  const totalMinutes = Math.ceil(diff / 60000);

  if (totalMinutes < 60) {
    return {
      label: `${totalMinutes}m remaining`,
      isExpired: false,
      isUrgent: totalMinutes <= 15,
    };
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    label: `${hours}h ${minutes}m remaining`,
    isExpired: false,
    isUrgent: false,
  };
}

export function computeSummary(reservations: Reservation[]): ReservationSummary {
  return {
    active: reservations.filter((r) =>
      ["CONFIRMED", "ARRIVED"].includes(r.reservationStatus),
    ).length,
    expired: reservations.filter((r) => r.reservationStatus === "EXPIRED").length,
    icu: reservations.filter((r) => r.bedType === "ICU").length,
    general: reservations.filter((r) => r.bedType === "GENERAL").length,
  };
}

export function getUniqueHospitals(reservations: Reservation[]): string[] {
  const names = new Set(reservations.map((r) => getHospitalName(r.hospital)));
  return Array.from(names).sort();
}

export function filterReservations(
  reservations: Reservation[],
  filters: ReservationFilters,
): Reservation[] {
  const query = filters.search.trim().toLowerCase();

  return reservations.filter((r) => {
    if (
      filters.status !== "ALL" &&
      r.reservationStatus !== filters.status
    ) {
      return false;
    }

    if (filters.bedType !== "ALL" && r.bedType !== filters.bedType) {
      return false;
    }

    if (filters.hospital !== "ALL") {
      if (getHospitalName(r.hospital) !== filters.hospital) return false;
    }

    if (!query) return true;

    return (
      r.patientName.toLowerCase().includes(query) ||
      getDoctorName(r.doctor).toLowerCase().includes(query) ||
      getHospitalName(r.hospital).toLowerCase().includes(query)
    );
  });
}

export function sortByExpiry(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort(
    (a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
  );
}

export function formatBedType(bedType: BedType): string {
  return bedType === "ICU" ? "ICU" : "General";
}
