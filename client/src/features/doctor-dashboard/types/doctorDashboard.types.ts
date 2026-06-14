import type { ReferralStatus } from "@/lib/constants";
import type { ReservationStatus } from "@/lib/constants";

export interface DoctorDashboardDoctor {
  id: string;
  name: string;
  specialization: string;
  status: string;
  currentPatients: number;
  maxPatients: number;
  profilePhoto?: string | null;
}

export interface DoctorDashboardHospital {
  id: string;
  name: string;
  city: string;
  logo?: string | null;
}

export interface DoctorDashboardStats {
  activeReservations: number;
  capacityUsed: string;
  assignedReferralCount: number;
  activeCaseCount: number;
  completedCaseCount: number;
}

export interface DoctorDashboardReferral {
  _id: string;
  patientName: string;
  age: number;
  condition: string;
  status: ReferralStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorDashboardCase {
  _id: string;
  patientName: string;
  reservationStatus: ReservationStatus;
  bedType: string;
  referral?: DoctorDashboardReferral | null;
  hospital?: { _id: string; name: string; city?: string };
  expiresAt?: string;
  createdAt?: string;
}

export interface DoctorDashboardData {
  doctor: DoctorDashboardDoctor;
  hospital: DoctorDashboardHospital;
  stats: DoctorDashboardStats;
  assignedReferrals: DoctorDashboardReferral[];
  activeCases: DoctorDashboardCase[];
  completedCases: DoctorDashboardCase[];
}
