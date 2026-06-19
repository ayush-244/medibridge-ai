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
  profilePhoto?: string | null;
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
  profilePhoto?: string | null;
  experience?: number;
  hospital: string;
  status?: DoctorStatus;
}

export interface UpdateDoctorPayload {
  name?: string;
  email?: string;
  specialization?: string;
  profilePhoto?: string | null;
  experience?: number;
  hospital?: string;
  status?: DoctorStatus;
}

export interface DoctorFormValues {
  name: string;
  email: string;
  specialization: string;
  profilePhoto: string | null;
  experience: string;
  hospital: string;
  status: DoctorStatus;
}

export interface DoctorFilters {
  search: string;
  status: DoctorStatus | "ALL";
  specialization: string;
}

export interface PendingDoctorUser {
  _id: string;
  name: string;
  email: string;
  hospital: DoctorHospital | string;
  doctorProfile?: Pick<
    Doctor,
    "_id" | "specialization" | "experience" | "phone"
  >;
}

export interface CreateDoctorResult {
  doctor: Doctor;
  temporaryPassword?: string;
}
