import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemporaryPasswordDialog } from "@/components/common/TemporaryPasswordDialog";
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import type {
  CreateUserFormValues,
  CreateUserPayload,
} from "@/features/users/types/user.types";
import { useAuth } from "@/hooks/useAuth";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const { user } = useAuth();
  const { createUser, isSubmitting } = useCreateUser();
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );

  const defaultHospitalId =
    user?.role === "HOSPITAL_ADMIN" ? user.hospital : null;

  const handleSubmit = async (values: CreateUserFormValues) => {
    const payload: CreateUserPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role as CreateUserPayload["role"],
      hospital: values.hospital || undefined,
      specialization: values.specialization.trim() || undefined,
      experience: values.experience
        ? Number(values.experience)
        : undefined,
    };

    const result = await createUser(payload);
    if (result) {
      onOpenChange(false);
      onSuccess?.();
      if (result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Register a new user account with role-based access.
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm
            key={`${open}-${defaultHospitalId ?? "all"}`}
            defaultHospitalId={defaultHospitalId}
            isSubmitting={isSubmitting}
            onSubmit={(values) => void handleSubmit(values)}
            onCancel={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>

      <TemporaryPasswordDialog
        open={Boolean(temporaryPassword)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTemporaryPassword(null);
        }}
        password={temporaryPassword || ""}
      />
    </>
  );
}
