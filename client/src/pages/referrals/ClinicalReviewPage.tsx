import { useParams } from "react-router-dom";
import { ClinicalReviewWorkspace } from "@/features/referrals/components/ClinicalReviewWorkspace";

export function ClinicalReviewPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-text-secondary">Referral ID is required</p>
      </div>
    );
  }

  return <ClinicalReviewWorkspace referralId={id} />;
}
