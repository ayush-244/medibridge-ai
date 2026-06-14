import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  toCreateHospitalPayload,
  toHospitalFormValues,
  validateHospitalForm,
} from "@/features/hospitals/utils/hospitalUtils";
import type {
  CreateHospitalPayload,
  Hospital,
  HospitalFormValues,
} from "@/features/hospitals/types/hospital.types";
import { showErrorToast } from "@/lib/toast";

interface HospitalFormProps {
  hospital?: Hospital;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (payload: CreateHospitalPayload) => void;
  onCancel: () => void;
}

export function HospitalForm({
  hospital,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: HospitalFormProps) {
  const [values, setValues] = useState<HospitalFormValues>(
    toHospitalFormValues(hospital),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateHospitalForm(values);
    if (error) {
      showErrorToast(error);
      return;
    }
    onSubmit(toCreateHospitalPayload(values));
  };

  const field = (key: keyof HospitalFormValues, label: string, type = "text") => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <Input
        type={type}
        value={values[key]}
        onChange={(e) => setValues({ ...values, [key]: e.target.value })}
        required={["name", "address", "city", "state", "totalBeds", "availableBeds", "totalICUBeds", "availableICUBeds"].includes(key)}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Hospital Name")}
        {field("contactNumber", "Contact Number")}
      </div>
      {field("address", "Address")}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("city", "City")}
        {field("state", "State")}
      </div>
      {field("email", "Email")}
      <div className="grid gap-4 sm:grid-cols-2">
        {field("totalBeds", "Total Beds", "number")}
        {field("availableBeds", "Available Beds", "number")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("totalICUBeds", "ICU Beds", "number")}
        {field("availableICUBeds", "Available ICU Beds", "number")}
      </div>
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
