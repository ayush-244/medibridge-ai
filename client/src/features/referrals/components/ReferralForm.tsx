import { useRef, useState, type FormEvent } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
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
import { ExtractionPreviewCard } from "@/features/referral-autofill/components/ExtractionPreviewCard";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import type { HospitalMatchResult } from "@/types/recommendation.types";
import type { ReferralAutofillData } from "@/features/referral-autofill/types/referralAutofill.types";
import { DestinationHospitalPicker } from "@/features/maps/components/DestinationHospitalPicker";
import {
  CREATE_REFERRAL_GENDERS,
  CREATE_REFERRAL_PRIORITIES,
  type CreateReferralFormErrors,
  type CreateReferralFormValues,
} from "@/features/referrals/types/referral.types";
import { validateReferralForm } from "@/features/referrals/utils/referralUtils";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadedFileInfo {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

interface ReferralFormProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  defaultFromHospitalId?: string | null;
  isSubmitting: boolean;
  values: CreateReferralFormValues;
  onUpdateField: <K extends keyof CreateReferralFormValues>(
    field: K,
    value: CreateReferralFormValues[K],
  ) => void;
  onSubmit: (values: CreateReferralFormValues) => void;
  onCancel: () => void;

  // Document upload props
  onUploadDocument: (file: File) => void;
  isUploading: boolean;
  docProgress: number;
  docError: string | null;
  uploadedFileName: string | null;
  onResetUpload: () => void;

  // AI Suggestions props
  isGenerating: boolean;
  specialist: (SpecialistRecommendation & { source?: string }) | null;
  aiHospitalRecommendations: HospitalMatchResult | null;
  aiError: string | null;
  onGenerateAi: () => void;
  onClearAi: () => void;
  onApplySpecialist: (specialist: string) => void;
  onSelectDestinationHospital: (hospitalId: string) => void;

  // Extraction props
  isExtracting: boolean;
  extractionData: ReferralAutofillData | null;
  extractionError: string | null;
  isExtractionApplied: boolean;
  onExtract: () => void;
  onApplyExtraction: () => void;
  onDiscardExtraction: () => void;
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
  doctors,
  defaultFromHospitalId,
  isSubmitting,
  values,
  onUpdateField,
  onSubmit,
  onCancel,

  onUploadDocument,
  isUploading,
  docProgress,
  docError,
  uploadedFileName,
  onResetUpload,

  isGenerating,
  specialist,
  aiHospitalRecommendations,
  aiError,
  onGenerateAi,
  onClearAi,
  onApplySpecialist,
  onSelectDestinationHospital,

  isExtracting,
  extractionData,
  extractionError,
  isExtractionApplied,
  onExtract,
  onApplyExtraction,
  onDiscardExtraction,
}: ReferralFormProps) {
  const [errors, setErrors] = useState<CreateReferralFormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFileInfo[]>([]);

  const canGenerateAi =
    uploadedFileName !== null ||
    values.diagnosis.trim().length > 0 ||
    values.conditionSummary.trim().length > 0;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    const nextErrors = validateReferralForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSubmit(values);
  };

  const handleUpdateField = <K extends keyof CreateReferralFormValues>(
    field: K,
    value: CreateReferralFormValues[K],
  ) => {
    onUpdateField(field, value);
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.type !== "application/pdf") continue;
      if (file.size > MAX_SIZE_BYTES) continue;
      validFiles.push(file);
    }

    const newFiles: UploadedFileInfo[] = validFiles.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    validFiles.forEach((file) => {
      onUploadDocument(file);
    });

    if (e.target) e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) {
      onResetUpload();
    }
  };

  const lockSourceHospital = Boolean(defaultFromHospitalId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Step 1: Patient Information */}
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
                handleUpdateField("patientName", event.target.value)
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
              onChange={(event) =>
                handleUpdateField("age", event.target.value)}
              placeholder="Enter age"
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              value={values.gender}
              onChange={(event) =>
                handleUpdateField(
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

          <div className="sm:col-span-2">
            <FormField
              label="Diagnosis"
              htmlFor="diagnosis"
              error={errors.diagnosis}
            >
              <Input
                id="diagnosis"
                value={values.diagnosis}
                onChange={(event) => handleUpdateField("diagnosis", event.target.value)}
                placeholder="Primary diagnosis"
              />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField
              label="Condition Summary"
              htmlFor="conditionSummary"
              error={errors.conditionSummary}
            >
              <Textarea
                id="conditionSummary"
                value={values.conditionSummary}
                onChange={(event) =>
                  handleUpdateField("conditionSummary", event.target.value)
                }
                placeholder="Brief summary of the patient's condition"
                rows={3}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Clinical Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clinical Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-text-secondary">
            Upload clinical documents to attach to the referral. PDF only, max {MAX_SIZE_MB} MB each.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload Clinical Documents"}
          </Button>

          {isUploading && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {docProgress}%
              </div>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${docProgress}%` }}
                />
              </div>
            </div>
          )}

          {docError && (
            <p className="text-sm text-danger">{docError}</p>
          )}

          {selectedFiles.length > 0 && (
            <div className="divide-y divide-border rounded-lg border border-border">
              {selectedFiles.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  {item.status === "done" || uploadedFileName ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="flex-1 truncate font-medium text-text-primary">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {uploadedFileName ? "Uploaded" : "Pending"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="rounded p-1 text-text-secondary hover:bg-muted hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadedFileName && (
            <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="flex-1 truncate font-medium">
                {uploadedFileName}
              </span>
              <button
                type="button"
                onClick={onResetUpload}
                className="rounded p-1 text-text-secondary hover:bg-muted hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 3: AI Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {uploadedFileName && !isExtracting && !extractionData && !extractionError && (
            <Button
              type="button"
              size="sm"
              className="w-full gap-2"
              onClick={onExtract}
            >
              <Sparkles className="h-4 w-4" />
              Extract Patient Information
            </Button>
          )}

          {isExtracting && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" />
              Extracting patient information...
            </div>
          )}

          {extractionError && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 p-3">
              <p className="text-sm text-danger">{extractionError}</p>
              <p className="mt-1 text-xs text-text-secondary">
                Please review the document or complete the form manually.
              </p>
            </div>
          )}

          {extractionData && (
            <ExtractionPreviewCard
              data={extractionData}
              onApply={onApplyExtraction}
              onDiscard={onDiscardExtraction}
              isApplied={isExtractionApplied}
            />
          )}

          <Button
            type="button"
            size="sm"
            className="w-full gap-2"
            disabled={!canGenerateAi || isGenerating}
            onClick={onGenerateAi}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Get AI Suggestions"}
          </Button>

          {aiError && (
            <p className="text-sm text-danger">{aiError}</p>
          )}

          {specialist && (
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  Specialist Recommendation
                </h4>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {specialist.confidence}% confidence
                </span>
              </div>
              <p className="mb-2 text-sm font-medium">
                {specialist.specialist}
              </p>
              <p className="mb-3 text-xs text-text-secondary">
                {specialist.reason}
              </p>
              {specialist.source && (
                <div className="mb-3">
                  <span
                    className={
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium " +
                      (specialist.source === "documents"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700")
                    }
                  >
                    {specialist.source === "documents"
                      ? "From Clinical Documents"
                      : "From Referral Data"}
                  </span>
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                onClick={() => onApplySpecialist(specialist.specialist)}
              >
                Apply Recommended Specialist
              </Button>
            </div>
          )}

          {aiHospitalRecommendations && aiHospitalRecommendations.recommendedHospitals.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-semibold">
                Recommended Hospitals
              </h4>
              <div className="space-y-2">
                {aiHospitalRecommendations.recommendedHospitals.map((hospital) => (
                  <div
                    key={hospital.hospitalId}
                    className="rounded-md border border-border p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {hospital.hospitalName}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {hospital.score}/100
                      </span>
                    </div>
                    <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-secondary">
                      <span>Specialist: {hospital.specialist}</span>
                      <span>Beds: {hospital.availableBeds}</span>
                      <span>Dr. {hospital.doctorName}</span>
                      <span>{hospital.distanceKm} km</span>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full gap-2"
                      onClick={() =>
                        onSelectDestinationHospital(hospital.hospitalId)
                      }
                    >
                      Use as Destination Hospital
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiHospitalRecommendations && aiHospitalRecommendations.recommendedHospitals.length === 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">
                No hospitals found with an available {aiHospitalRecommendations.specialist} specialist nearby. Try a different diagnosis or upload a clinical document.
              </p>
            </div>
          )}

          {(specialist || aiHospitalRecommendations) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={onClearAi}
            >
              <X className="h-4 w-4" />
              Clear Suggestions
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Referral Routing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referral Routing</CardTitle>
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
                handleUpdateField("fromHospital", event.target.value)
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
            <DestinationHospitalPicker
              hospitals={hospitals}
              doctors={doctors}
              sourceHospitalId={values.fromHospital}
              value={values.toHospital}
              requiredSpecialty={values.requiredSpecialty}
              error={errors.toHospital}
              onChange={(hospitalId) => handleUpdateField("toHospital", hospitalId)}
            />
          </FormField>

          <FormField
            label="Required Specialty"
            htmlFor="requiredSpecialty"
            error={errors.requiredSpecialty}
          >
            <Select
              value={values.requiredSpecialty}
              onValueChange={(specialty) =>
                handleUpdateField("requiredSpecialty", specialty)
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

          <FormField label="Priority" htmlFor="priority" error={errors.priority}>
            <Select
              id="priority"
              value={values.priority}
              onChange={(event) =>
                handleUpdateField(
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

          <div className="sm:col-span-2">
            <FormField label="Notes" htmlFor="notes" error={errors.notes}>
              <Textarea
                id="notes"
                value={values.notes}
                onChange={(event) => handleUpdateField("notes", event.target.value)}
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
