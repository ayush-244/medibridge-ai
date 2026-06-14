import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import {
  CREATE_REFERRAL_GENDERS,
  CREATE_REFERRAL_PRIORITIES,
  type CreateReferralFormErrors,
  type CreateReferralFormValues,
} from "@/features/referrals/types/referral.types";
import {
  getInitialReferralFormValues,
  validateReferralForm,
} from "@/features/referrals/utils/referralUtils";

interface ReferralFormProps {
  hospitals: Hospital[];
  defaultFromHospitalId?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: CreateReferralFormValues) => void;
  onCancel: () => void;
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function formatGenderLabel(value: (typeof CREATE_REFERRAL_GENDERS)[number]) {
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatPriorityLabel(value: (typeof CREATE_REFERRAL_PRIORITIES)[number]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function ReferralForm({
  hospitals,
  defaultFromHospitalId,
  isSubmitting,
  onSubmit,
  onCancel,
}: ReferralFormProps) {
  const [values, setValues] = useState<CreateReferralFormValues>(() =>
    getInitialReferralFormValues(defaultFromHospitalId),
  );
  const [errors, setErrors] = useState<CreateReferralFormErrors>({});

  const updateField = <K extends keyof CreateReferralFormValues>(
    field: K,
    value: CreateReferralFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateReferralForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  const lockSourceHospital = Boolean(defaultFromHospitalId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Patient Name"
            htmlFor="patientName"
            error={errors.patientName}
          >
            <Input
              id="patientName"
              value={values.patientName}
              onChange={(event) =>
                updateField("patientName", event.target.value)
              }
              placeholder="Enter patient name"
            />
          </FormField>

          <FormField label="Age" htmlFor="age" error={errors.age}>
            <Input
              id="age"
              type="number"
              min={1}
              value={values.age}
              onChange={(event) => updateField("age", event.target.value)}
              placeholder="Enter age"
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              value={values.gender}
              onChange={(event) =>
                updateField(
                  "gender",
                  event.target.value as CreateReferralFormValues["gender"],
                )
              }
            >
              <option value="">Select gender</option>
              {CREATE_REFERRAL_GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {formatGenderLabel(gender)}
                </option>
              ))}
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField
            label="Diagnosis"
            htmlFor="diagnosis"
            error={errors.diagnosis}
          >
            <Input
              id="diagnosis"
              value={values.diagnosis}
              onChange={(event) => updateField("diagnosis", event.target.value)}
              placeholder="Primary diagnosis"
            />
          </FormField>

          <FormField
            label="Condition Summary"
            htmlFor="conditionSummary"
            error={errors.conditionSummary}
          >
            <Textarea
              id="conditionSummary"
              value={values.conditionSummary}
              onChange={(event) =>
                updateField("conditionSummary", event.target.value)
              }
              placeholder="Brief summary of the patient's condition"
            />
          </FormField>

          <FormField label="Priority" htmlFor="priority" error={errors.priority}>
            <Select
              id="priority"
              value={values.priority}
              onChange={(event) =>
                updateField(
                  "priority",
                  event.target.value as CreateReferralFormValues["priority"],
                )
              }
            >
              <option value="">Select priority</option>
              {CREATE_REFERRAL_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {formatPriorityLabel(priority)}
                </option>
              ))}
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referral Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Source Hospital"
            htmlFor="fromHospital"
            error={errors.fromHospital}
          >
            <Select
              id="fromHospital"
              value={values.fromHospital}
              disabled={lockSourceHospital}
              onChange={(event) =>
                updateField("fromHospital", event.target.value)
              }
            >
              <option value="">Select source hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name} — {hospital.city}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Destination Hospital"
            htmlFor="toHospital"
            error={errors.toHospital}
          >
            <Select
              id="toHospital"
              value={values.toHospital}
              onChange={(event) => updateField("toHospital", event.target.value)}
            >
              <option value="">Select destination hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name} — {hospital.city}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Required Specialty"
            htmlFor="requiredSpecialty"
            error={errors.requiredSpecialty}
          >
            <Select
              value={values.requiredSpecialty}
              onValueChange={(specialty) =>
                updateField("requiredSpecialty", specialty)
              }
            >
              <SelectTrigger id="requiredSpecialty">
                <SelectValue placeholder="Select required specialty" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALIZATIONS.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Notes" htmlFor="notes" error={errors.notes}>
              <Textarea
                id="notes"
                value={values.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Additional referral notes"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Referral
        </Button>
      </div>
    </form>
  );
}
