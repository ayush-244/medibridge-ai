export interface SystemSummary {
  totalHospitals: number;
  totalDoctors: number;
  availableDoctors: number;
  busyDoctors: number;
  totalReferrals: number;
  acceptedReferrals: number;
  completedReferrals: number;
  activeReservations: number;
  pendingUsers: number;
}

export interface HospitalSummary {
  totalHospitals: number;
  totalBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
}

export interface DoctorSummary {
  totalDoctors: number;
  availableDoctors: number;
  busyDoctors: number;
  offDutyDoctors: number;
  averageLoad: number | string;
}

export interface ReferralSummary {
  totalReferrals: number;
  accepted: number;
  pending: number;
  rejected: number;
  completed: number;
  acceptanceRate: string;
}

export interface TopHospitalRanking {
  hospitalName: string;
  city: string;
  acceptedReferrals: number;
  availableBeds: number;
  availableDoctors: number;
}

export interface HospitalAnalytics {
  hospitalName: string;
  city: string;
  totalDoctors: number;
  availableDoctors: number;
  totalBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
  totalReferrals: number;
  acceptedReferrals: number;
  occupancyRate: string;
}

export interface ReportsData {
  system: SystemSummary;
  hospital: HospitalSummary;
  doctor: DoctorSummary;
  referral: ReferralSummary;
  topHospitals: TopHospitalRanking[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}
