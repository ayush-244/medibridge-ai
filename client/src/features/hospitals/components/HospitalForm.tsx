import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
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
  onSubmit: (
    payload: CreateHospitalPayload,
    options: { logoFile: File | null; removeLogo: boolean },
  ) => void;
  onCancel: () => void;
}

const ALLOWED_LOGO_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_LOGO_SIZE = 5 * 1024 * 1024;

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const previewHospital = {
    name: values.name || hospital?.name || "Hospital",
    logo: removeLogo ? null : values.logo,
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      showErrorToast("Only JPG, JPEG, PNG, and WEBP images are allowed");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      showErrorToast("Logo must be 5 MB or smaller");
      return;
    }

    setLogoFile(file);
    setRemoveLogo(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateHospitalForm(values);
    if (error) {
      showErrorToast(error);
      return;
    }
    onSubmit(toCreateHospitalPayload(values), { logoFile, removeLogo });
  };

  const field = (
    key: keyof HospitalFormValues,
    label: string,
    type = "text",
  ) => {
    if (key === "logo") return null;

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <Input
          type={type}
          value={values[key] as string}
          onChange={(e) => setValues({ ...values, [key]: e.target.value })}
          required={[
            "name",
            "address",
            "city",
            "state",
            "latitude",
            "longitude",
            "totalBeds",
            "availableBeds",
            "totalICUBeds",
            "availableICUBeds",
          ].includes(key)}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <HospitalAvatar hospital={previewHospital} size="lg" />
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Hospital Logo
          </label>
          <Input type="file" accept="image/*" onChange={handleLogoChange} />
          {values.logo && !removeLogo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRemoveLogo(true);
                setLogoFile(null);
                setValues({ ...values, logo: null });
              }}
            >
              Remove logo
            </Button>
          )}
        </div>
      </div>

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
        {field("latitude", "Latitude", "number")}
        {field("longitude", "Longitude", "number")}
      </div>
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
