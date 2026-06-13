import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ReferralAction } from "@/features/referrals/types/referral.types";

const actionLabels: Record<ReferralAction, string> = {
  accept: "Accept Referral",
  reject: "Reject Referral",
  complete: "Complete Referral",
};

const actionDescriptions: Record<ReferralAction, string> = {
  accept:
    "This will accept the referral, assign a doctor, and reserve a bed. This action cannot be undone.",
  reject:
    "This will reject the referral. The patient will need to be referred elsewhere.",
  complete:
    "This will mark the referral as completed. Confirm the patient transfer is finished.",
};

const actionVariants: Record<ReferralAction, "default" | "danger" | "secondary"> = {
  accept: "default",
  reject: "danger",
  complete: "default",
};

interface ReferralConfirmDialogProps {
  open: boolean;
  action: ReferralAction | null;
  patientName?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReferralConfirmDialog({
  open,
  action,
  patientName,
  isLoading,
  onConfirm,
  onCancel,
}: ReferralConfirmDialogProps) {
  if (!action) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionLabels[action]}</DialogTitle>
          <DialogDescription>
            {patientName
              ? `Confirm action for ${patientName}. ${actionDescriptions[action]}`
              : actionDescriptions[action]}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={actionVariants[action]}
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
