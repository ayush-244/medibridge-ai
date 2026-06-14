import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HospitalForm } from "@/features/hospitals/components/HospitalForm";
import { useHospitalMutations } from "@/features/hospitals/hooks/useHospitalMutations";
import type {
  CreateHospitalPayload,
  Hospital,
} from "@/features/hospitals/types/hospital.types";

interface EditHospitalDialogProps {
  hospital: Hospital | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditHospitalDialog({
  hospital,
  open,
  onOpenChange,
  onSuccess,
}: EditHospitalDialogProps) {
  const { isSubmitting, updateHospital } = useHospitalMutations();

  const handleSubmit = async (payload: CreateHospitalPayload) => {
    if (!hospital) return;
    const updated = await updateHospital(hospital._id, payload);
    if (updated) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Hospital</DialogTitle>
          <DialogDescription>
            Update hospital details and capacity settings.
          </DialogDescription>
        </DialogHeader>
        {hospital && (
          <HospitalForm
            key={hospital._id}
            hospital={hospital}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            onSubmit={(payload) => void handleSubmit(payload)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
