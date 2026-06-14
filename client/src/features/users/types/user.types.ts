import type { ManageableRole, UserRole, UserStatus } from "@/lib/constants";

export interface UserHospital {
  _id: string;
  name: string;
  city?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  role: UserRole;
  hospital?: UserHospital | string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserDoctorProfile {
  _id: string;
  name: string;
  specialization: string;
  profilePhoto?: string | null;
  experience?: number;
  hospital?: UserHospital | string;
}

export interface UserDetail extends User {
  doctorProfile?: UserDoctorProfile | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: ManageableRole;
  hospital?: string;
  specialization?: string;
  experience?: number;
}

export interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
  role: ManageableRole | "";
  hospital: string;
  specialization: string;
  experience: string;
}

export interface UserFilters {
  search: string;
  role: UserRole | "ALL";
}

export type { UserStatus };
