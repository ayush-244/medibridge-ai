import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReferralForm } from "@/features/referrals/components/ReferralForm";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { useCreateReferral } from "@/features/referrals/hooks/useCreateReferral";
import type { CreateReferralFormValues } from "@/features/referrals/types/referral.types";
import { toCreateReferralRequest } from "@/features/referrals/utils/referralUtils";
import { useAuth } from "@/hooks/useAuth";
import { showErrorToast } from "@/lib/toast";

interface CreateReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateReferralDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateReferralDialogProps) {
  const { user } = useAuth();
  const { hospitals } = useHospitals();
  const { doctors } = useDoctors();
  const { createReferral, isSubmitting } = useCreateReferral();

  const defaultFromHospitalId =
    user?.role === "SUPER_ADMIN" ? null : user?.hospital;

  const handleSubmit = async (values: CreateReferralFormValues) => {
    if (!user?.id) {
      return;
    }

    let payload;
    try {
      payload = toCreateReferralRequest(values, user.id);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid referral details";
      showErrorToast(message);
      return;
    }

    const referral = await createReferral(payload);

    if (referral) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Referral</DialogTitle>
          <DialogDescription>
            Submit a new patient referral to route care between hospitals.
          </DialogDescription>
        </DialogHeader>

        <ReferralForm
          key={`${open}-${defaultFromHospitalId ?? "all"}`}
          hospitals={hospitals}
          doctors={doctors}
          defaultFromHospitalId={defaultFromHospitalId}
          isSubmitting={isSubmitting}
          onSubmit={(values) => void handleSubmit(values)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
