import type { ReferralStatus } from "@/lib/constants";

export interface ReferralHospital {
  _id: string;
  name: string;
  city: string;
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
