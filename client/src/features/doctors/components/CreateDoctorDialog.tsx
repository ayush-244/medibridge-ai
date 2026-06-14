import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorForm } from "@/features/doctors/components/DoctorForm";
import { useDoctorMutations } from "@/features/doctors/hooks/useDoctorMutations";
import type { CreateDoctorPayload } from "@/features/doctors/types/doctor.types";
import { useAuth } from "@/hooks/useAuth";

interface CreateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDoctorDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDoctorDialogProps) {
  const { user } = useAuth();
  const { isSubmitting, createDoctor } = useDoctorMutations();

  const defaultHospitalId =
    user?.role === "HOSPITAL_ADMIN" ? user.hospital : null;

  const handleSubmit = async (payload: CreateDoctorPayload) => {
    const doctor = await createDoctor(payload);
    if (doctor) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Doctor</DialogTitle>
          <DialogDescription>
            Register a new physician in the hospital network.
          </DialogDescription>
        </DialogHeader>
        <DoctorForm
          key={`${open}-${defaultHospitalId ?? "all"}`}
          defaultHospitalId={defaultHospitalId}
          showHospitalSelect={user?.role === "SUPER_ADMIN"}
          isSubmitting={isSubmitting}
          submitLabel="Create Doctor"
          onSubmit={(payload) => void handleSubmit(payload)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
