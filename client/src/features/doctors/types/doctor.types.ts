import type { DoctorStatus } from "@/lib/constants";

export interface DoctorHospital {
  _id: string;
  name: string;
  city: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email?: string;
  specialization: string;
  experience?: number;
  hospital: DoctorHospital | string;
  status: DoctorStatus;
  phone?: string;
  currentPatients: number;
  maxPatients: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDoctorPayload {
  name: string;
  email?: string;
  specialization: string;
  experience?: number;
  hospital: string;
  status?: DoctorStatus;
}

export interface UpdateDoctorPayload {
  name?: string;
  email?: string;
  specialization?: string;
  experience?: number;
  hospital?: string;
  status?: DoctorStatus;
}

export interface DoctorFormValues {
  name: string;
  email: string;
  specialization: string;
  experience: string;
  hospital: string;
  status: DoctorStatus;
}

export interface DoctorFilters {
  search: string;
  status: DoctorStatus | "ALL";
  specialization: string;
}
