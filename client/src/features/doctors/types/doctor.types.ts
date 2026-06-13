import type { DoctorStatus } from "@/lib/constants";

export interface DoctorHospital {
  _id: string;
  name: string;
  city: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  hospital: DoctorHospital | string;
  status: DoctorStatus;
  phone?: string;
  currentPatients: number;
  maxPatients: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorFilters {
  search: string;
  status: DoctorStatus | "ALL";
  specialization: string;
}
