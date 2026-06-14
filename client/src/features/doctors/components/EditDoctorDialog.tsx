import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorForm } from "@/features/doctors/components/DoctorForm";
import { useDoctorMutations } from "@/features/doctors/hooks/useDoctorMutations";
import type {
  CreateDoctorPayload,
  Doctor,
} from "@/features/doctors/types/doctor.types";
import { useAuth } from "@/hooks/useAuth";

interface EditDoctorDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditDoctorDialog({
  doctor,
  open,
  onOpenChange,
  onSuccess,
}: EditDoctorDialogProps) {
  const { user } = useAuth();
  const { isSubmitting, updateDoctor } = useDoctorMutations();

  const handleSubmit = async (payload: CreateDoctorPayload) => {
    if (!doctor) return;
    const updated = await updateDoctor(doctor._id, payload);
    if (updated) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
          <DialogDescription>
            Update physician details and availability.
          </DialogDescription>
        </DialogHeader>
        {doctor && (
          <DoctorForm
            key={doctor._id}
            doctor={doctor}
            showHospitalSelect={user?.role === "SUPER_ADMIN"}
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
