import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MANAGEABLE_ROLES } from "@/lib/constants";
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
  password: "",
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Password
          </label>
          <Input
            type="password"
            value={values.password}
            onChange={(e) =>
              setValues({ ...values, password: e.target.value })
            }
            placeholder="Min. 6 characters"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
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
            <Input
              value={values.specialization}
              onChange={(e) =>
                setValues({ ...values, specialization: e.target.value })
              }
              placeholder="e.g. Cardiology"
              required
            />
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
