export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  HOSPITAL_ADMIN: "HOSPITAL_ADMIN",
  REFERRAL_COORDINATOR: "REFERRAL_COORDINATOR",
  DOCTOR: "DOCTOR",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const REFERRAL_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
] as const;

export type ReferralStatus = (typeof REFERRAL_STATUSES)[number];

export const REFERRAL_PRIORITIES = ["CRITICAL", "HIGH", "NORMAL"] as const;

export type ReferralPriority = (typeof REFERRAL_PRIORITIES)[number];

export const REFERRAL_VIEW_STORAGE_KEY = "medibridge_referral_view";

export const DOCTOR_STATUSES = ["AVAILABLE", "BUSY", "OFF_DUTY"] as const;

export type DoctorStatus = (typeof DOCTOR_STATUSES)[number];

export const HOSPITAL_CAPACITY_STATUSES = [
  "operational",
  "limited",
  "at_capacity",
] as const;

export type HospitalCapacityStatus =
  (typeof HOSPITAL_CAPACITY_STATUSES)[number];

export const RESERVATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "EXPIRED",
  "CANCELLED",
  "COMPLETED",
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const BED_TYPES = ["GENERAL", "ICU"] as const;

export type BedType = (typeof BED_TYPES)[number];

export const AUTH_STORAGE_KEY = "medibridge_auth";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
