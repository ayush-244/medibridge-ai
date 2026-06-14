import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HospitalForm } from "@/features/hospitals/components/HospitalForm";
import { useHospitalMutations } from "@/features/hospitals/hooks/useHospitalMutations";
import type { CreateHospitalPayload } from "@/features/hospitals/types/hospital.types";

interface CreateHospitalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateHospitalDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateHospitalDialogProps) {
  const { isSubmitting, createHospital } = useHospitalMutations();

  const handleSubmit = async (payload: CreateHospitalPayload) => {
    const hospital = await createHospital(payload);
    if (hospital) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Hospital</DialogTitle>
          <DialogDescription>
            Register a new hospital facility in the network.
          </DialogDescription>
        </DialogHeader>
        <HospitalForm
          key={String(open)}
          isSubmitting={isSubmitting}
          submitLabel="Create Hospital"
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
