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
import { DOCTOR_STATUSES } from "@/lib/constants";
import {
  SPECIALIZATIONS,
  type Specialization,
} from "@/lib/constants/specializations";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import {
  toCreateDoctorPayload,
  toDoctorFormValues,
  validateDoctorForm,
} from "@/features/doctors/utils/doctorUtils";
import type {
  CreateDoctorPayload,
  Doctor,
  DoctorFormValues,
} from "@/features/doctors/types/doctor.types";
import type { DoctorStatus } from "@/lib/constants";
import { showErrorToast } from "@/lib/toast";

function getSpecializationOptions(currentValue: string) {
  if (!currentValue || SPECIALIZATIONS.includes(currentValue as Specialization)) {
    return [...SPECIALIZATIONS];
  }

  return [currentValue, ...SPECIALIZATIONS];
}

interface DoctorFormProps {
  doctor?: Doctor;
  defaultHospitalId?: string | null;
  showHospitalSelect?: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (payload: CreateDoctorPayload) => void;
  onCancel: () => void;
}

export function DoctorForm({
  doctor,
  defaultHospitalId,
  showHospitalSelect = true,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: DoctorFormProps) {
  const { hospitals } = useHospitals();
  const [values, setValues] = useState<DoctorFormValues>(() => {
    const initial = toDoctorFormValues(doctor);
    if (defaultHospitalId && !initial.hospital) {
      initial.hospital = defaultHospitalId;
    }
    return initial;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateDoctorForm(values, doctor?.specialization);
    if (error) {
      showErrorToast(error);
      return;
    }
    onSubmit(toCreateDoctorPayload(values));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <Input
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Specialization</label>
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
              {getSpecializationOptions(values.specialization).map(
                (specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Experience (years)</label>
          <Input
            type="number"
            min={0}
            value={values.experience}
            onChange={(e) =>
              setValues({ ...values, experience: e.target.value })
            }
          />
        </div>
      </div>
      {showHospitalSelect && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Hospital</label>
          <Select
            value={values.hospital}
            onChange={(e) =>
              setValues({ ...values, hospital: e.target.value })
            }
            required
            disabled={Boolean(defaultHospitalId && !doctor)}
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
      {doctor && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Availability</label>
          <Select
            value={values.status}
            onChange={(e) =>
              setValues({
                ...values,
                status: e.target.value as DoctorStatus,
              })
            }
          >
            {DOCTOR_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
