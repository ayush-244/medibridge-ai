import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type {
  DoctorSummary,
  HospitalSummary,
  ReferralSummary,
  ReportsData,
  SystemSummary,
  TopHospitalRanking,
} from "@/features/reports/types/report.types";

export const reportService = {
  async getAllReports(): Promise<ReportsData> {
    const [
      systemRes,
      hospitalRes,
      doctorRes,
      referralRes,
      topHospitalsRes,
    ] = await Promise.all([
      api.get<ApiResponse<SystemSummary>>("/reports/system-summary"),
      api.get<ApiResponse<HospitalSummary>>("/reports/hospital-summary"),
      api.get<ApiResponse<DoctorSummary>>("/reports/doctor-summary"),
      api.get<ApiResponse<ReferralSummary>>("/reports/referral-summary"),
      api.get<ApiResponse<TopHospitalRanking[]>>("/reports/top-hospitals"),
    ]);

    const responses = [
      systemRes.data,
      hospitalRes.data,
      doctorRes.data,
      referralRes.data,
      topHospitalsRes.data,
    ];

    for (const res of responses) {
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to load reports");
      }
    }

    return {
      system: systemRes.data.data!,
      hospital: hospitalRes.data.data!,
      doctor: doctorRes.data.data!,
      referral: referralRes.data.data!,
      topHospitals: topHospitalsRes.data.data!,
    };
  },

  async getHospitalAnalytics(hospitalId: string) {
    const { data } = await api.get(`/reports/hospital/${hospitalId}`);
    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to load hospital analytics");
    }
    return data.data;
  },
};
