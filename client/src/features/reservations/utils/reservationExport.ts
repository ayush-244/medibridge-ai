import { exportToCsv } from "@/lib/csvExport";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { formatReservationDate } from "@/features/reservations/utils/reservationUtils";

function getReferralPatientName(
  referral: Reservation["referral"],
): string {
  if (!referral) return "—";
  if (typeof referral === "string") return referral;
  return referral.patientName;
}

function getHospitalName(hospital: Reservation["hospital"]): string {
  if (!hospital) return "—";
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

export function exportReservationsToCsv(reservations: Reservation[]) {
  exportToCsv(
    `reservations-${new Date().toISOString().slice(0, 10)}`,
    [
      "Patient Name",
      "Referral",
      "Hospital",
      "Bed Type",
      "Status",
      "Reserved At",
      "Expires At",
    ],
    reservations.map((reservation) => [
      reservation.patientName,
      getReferralPatientName(reservation.referral),
      getHospitalName(reservation.hospital),
      reservation.bedType,
      reservation.reservationStatus,
      formatReservationDate(reservation.reservedAt),
      formatReservationDate(reservation.expiresAt),
    ]),
  );
}
