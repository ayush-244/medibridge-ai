import type { BedType, ReservationStatus } from "@/lib/constants";

export interface ReservationDoctor {
  _id: string;
  name: string;
  specialization: string;
}

export interface ReservationHospital {
  _id: string;
  name: string;
  city: string;
}

export interface ReservationReferral {
  _id: string;
  patientName: string;
}

export interface Reservation {
  _id: string;
  patientName: string;
  referral: ReservationReferral | string;
  hospital: ReservationHospital | string;
  doctor: ReservationDoctor | string;
  bedType: BedType;
  reservationStatus: ReservationStatus;
  reservedAt?: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationFilters {
  search: string;
  status: ReservationStatus | "ALL";
  bedType: BedType | "ALL";
  hospital: string;
}

export interface ReservationSummary {
  active: number;
  expired: number;
  icu: number;
  general: number;
}
