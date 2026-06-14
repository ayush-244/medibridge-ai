import { exportToCsv } from "@/lib/csvExport";
import type { Referral } from "@/features/referrals/types/referral.types";
import {
  formatReferralDate,
  getHospitalName,
} from "@/features/referrals/utils/referralUtils";

export function exportReferralsToCsv(referrals: Referral[]) {
  exportToCsv(
    `referrals-${new Date().toISOString().slice(0, 10)}`,
    [
      "Patient Name",
      "Age",
      "Condition",
      "Status",
      "From Hospital",
      "To Hospital",
      "Created",
      "Updated",
    ],
    referrals.map((referral) => [
      referral.patientName,
      referral.age,
      referral.condition,
      referral.status,
      getHospitalName(referral.fromHospital),
      getHospitalName(referral.toHospital),
      formatReferralDate(referral.createdAt),
      formatReferralDate(referral.updatedAt),
    ]),
  );
}
