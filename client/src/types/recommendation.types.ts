export interface HospitalMatchBreakdown {
  specialistScore: number;
  doctorCapacityScore: number;
  bedScore: number;
  distanceScore: number;
}

export interface RecommendedHospital {
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  specialist: string;
  availableBeds: number;
  distanceKm: number;
  score: number;
  breakdown: HospitalMatchBreakdown;
}

export interface HospitalMatchResult {
  specialist: string;
  recommendedHospitals: RecommendedHospital[];
}

export interface HospitalMatchRequest {
  patient_id: string;
  referral_id: string;
}
