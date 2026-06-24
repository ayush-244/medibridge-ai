import type { HospitalLocation } from "@/features/hospitals/types/hospital.types";
import type { ReferralStatus } from "@/lib/constants";

export interface ReferralHospital {
  _id: string;
  name: string;
  city: string;
  location?: HospitalLocation;
  logo?: string | null;
}

export interface ReferralUser {
  _id: string;
  name: string;
  email: string;
}

export interface Referral {
  _id: string;
  patientName: string;
  age: number;
  condition: string;
  fromHospital: ReferralHospital | string;
  toHospital: ReferralHospital | string;
  requestedBy: ReferralUser | string;
  status: ReferralStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type ReferralViewMode = "table" | "kanban";

export type ReferralDirection = "all" | "inbound" | "outbound";

export type ReferralSortField =
  | "patientName"
  | "condition"
  | "status"
  | "createdAt"
  | "fromHospital"
  | "toHospital";

export type SortDirection = "asc" | "desc";

export interface ReferralFilters {
  search: string;
  status: ReferralStatus | "ALL";
  hospital: string;
}

export type ReferralAction = "accept" | "reject" | "complete";

export interface TimelineStep {
  label: string;
  key: string;
  completed: boolean;
  rejected?: boolean;
}

export interface ReferralQueryParams {
  status?: ReferralStatus;
  patientName?: string;
  condition?: string;
}

export const CREATE_REFERRAL_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type CreateReferralPriority =
  (typeof CREATE_REFERRAL_PRIORITIES)[number];

export const CREATE_REFERRAL_GENDERS = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;

export type CreateReferralGender =
  (typeof CREATE_REFERRAL_GENDERS)[number];

export interface CreateReferralFormValues {
  patientName: string;
  age: string;
  gender: CreateReferralGender | "";
  diagnosis: string;
  conditionSummary: string;
  priority: CreateReferralPriority | "";
  fromHospital: string;
  toHospital: string;
  requiredSpecialty: string;
  notes: string;
}

export interface CreateReferralRequest {
  patientName: string;
  age: number;
  condition: string;
  fromHospital: string;
  toHospital: string;
  requestedBy: string;
}

export type CreateReferralFormErrors = Partial<
  Record<keyof CreateReferralFormValues, string>
>;

export interface ReferralDocument {
  _id: string;
  referralId: string;
  filename: string;
  originalFilename: string;
  uploadedBy?: string;
  uploadedByName: string;
  fileSize: number;
  mimeType: string;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TimelineEventType =
  | "REFERRAL_CREATED"
  | "AI_AUTOFILL_GENERATED"
  | "SPECIALIST_RECOMMENDED"
  | "HOSPITAL_RECOMMENDED"
  | "REFERRAL_SUBMITTED"
  | "REFERRAL_ACCEPTED"
  | "REFERRAL_REJECTED"
  | "DOCTOR_ASSIGNED"
  | "BED_RESERVED"
  | "RESERVATION_EXTENDED"
  | "PATIENT_ARRIVED"
  | "RESERVATION_CANCELLED"
  | "RESERVATION_COMPLETED"
  | "REFERRAL_COMPLETED";

export interface TimelineEventItem {
  _id: string;
  referralId: string;
  eventType: TimelineEventType;
  actorId?: string;
  actorName: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
