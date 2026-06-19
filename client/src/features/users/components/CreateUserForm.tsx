import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MANAGEABLE_ROLES } from "@/lib/constants";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { validateCreateUserForm } from "@/features/users/utils/userUtils";
import type { CreateUserFormValues } from "@/features/users/types/user.types";
import { showErrorToast } from "@/lib/toast";

interface CreateUserFormProps {
  defaultHospitalId?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: CreateUserFormValues) => void;
  onCancel: () => void;
}

const initialValues: CreateUserFormValues = {
  name: "",
  email: "",
  role: "",
  hospital: "",
  specialization: "",
  experience: "",
};

export function CreateUserForm({
  defaultHospitalId,
  isSubmitting,
  onSubmit,
  onCancel,
}: CreateUserFormProps) {
  const { hospitals } = useHospitals();
  const [values, setValues] = useState<CreateUserFormValues>({
    ...initialValues,
    hospital: defaultHospitalId || "",
  });

  const isDoctor = values.role === "DOCTOR";
  const showHospital =
    values.role !== "" &&
    ["HOSPITAL_ADMIN", "REFERRAL_COORDINATOR", "DOCTOR"].includes(values.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCreateUserForm(values);
    if (error) {
      showErrorToast(error);
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Name</label>
          <Input
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            placeholder="Full name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            placeholder="user@hospital.com"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-text-primary">Role</label>
          <Select
            value={values.role}
            onChange={(e) =>
              setValues({ ...values, role: e.target.value as CreateUserFormValues["role"] })
            }
            required
          >
            <option value="">Select role</option>
            {MANAGEABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
          <p className="text-xs text-text-secondary">
            A temporary password (MediBridge@123) will be generated automatically.
            The user must change it on first login.
          </p>
        </div>
      </div>

      {showHospital && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Hospital
          </label>
          <Select
            value={values.hospital}
            onChange={(e) =>
              setValues({ ...values, hospital: e.target.value })
            }
            required
            disabled={Boolean(defaultHospitalId)}
          >
            <option value="">Select hospital</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} — {h.city}
              </option>
            ))}
          </Select>
        </div>
      )}

      {isDoctor && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Specialization
            </label>
            <Select
              value={values.specialization}
              onValueChange={(specialization) =>
                setValues({ ...values, specialization })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Experience (years)
            </label>
            <Input
              type="number"
              min={0}
              value={values.experience}
              onChange={(e) =>
                setValues({ ...values, experience: e.target.value })
              }
              placeholder="Years of experience"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
