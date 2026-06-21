import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SpecialistRecommendation } from "@/features/ai-recommendations/types/recommendation.types";
import type { HospitalMatchResult, RecommendedHospital } from "@/types/recommendation.types";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface AiSuggestionPanelProps {
  patientName: string;
  age: string;
  diagnosis: string;
  conditionSummary: string;
  originHospitalId: string;
  isGenerating: boolean;
  specialist: (SpecialistRecommendation & { source?: string }) | null;
  hospitals: HospitalMatchResult | null;
  error: string | null;
  docProgress: number;
  isUploading: boolean;
  docError: string | null;
  uploadedFileName: string | null;
  onGenerate: () => void;
  onUpload: (file: File) => void;
  onResetUpload: () => void;
  onClear: () => void;
  onApplySpecialist: (specialist: string) => void;
  onSelectDestinationHospital: (hospitalId: string) => void;
}

export function AiSuggestionPanel({
  patientName,
  age,
  diagnosis,
  conditionSummary,
  originHospitalId,
  isGenerating,
  specialist,
  hospitals,
  error,
  docProgress,
  isUploading,
  docError,
  uploadedFileName,
  onGenerate,
  onUpload,
  onResetUpload,
  onClear,
  onApplySpecialist,
  onSelectHospital,
}: AiSuggestionPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canGenerate =
    uploadedFileName !== null ||
    diagnosis.trim().length > 0 ||
    conditionSummary.trim().length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setValidationError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setValidationError("Only PDF files are allowed");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError(`File must be ${MAX_SIZE_MB} MB or smaller`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    if (!docError) {
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setValidationError(null);
    onResetUpload();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Suggestions
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-3 text-sm font-semibold">
              Upload Clinical Documents
            </h4>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!uploadedFileName && !isUploading && !selectedFile && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                onClick={() => inputRef.current?.click()}
              >
                <FileText className="h-4 w-4" />
                Select PDF
              </Button>
            )}

            {selectedFile && !isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                  <span className="max-w-[200px] truncate font-medium">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => void handleUpload()}
                >
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading... {docProgress}%
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${docProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadedFileName && !isUploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="max-w-[200px] truncate font-medium">
                    {uploadedFileName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleClear}
                >
                  <Upload className="h-4 w-4" />
                  Upload Another
                </Button>
              </div>
            )}

            {(validationError || docError) && (
              <p className="mt-1 text-sm text-danger">
                {validationError || docError}
              </p>
            )}

            <p className="mt-2 text-xs text-text-secondary">
              PDF only, max {MAX_SIZE_MB} MB.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            className="w-full gap-2"
            disabled={!canGenerate || isGenerating}
            onClick={onGenerate}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Get AI Suggestions"}
          </Button>

          {error && (
            <p className="text-sm text-danger">{error}</p>
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

          {hospitals && hospitals.recommendedHospitals.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <h4 className="mb-2 text-sm font-semibold">
                Recommended Hospitals
              </h4>
              <div className="space-y-2">
                {hospitals.recommendedHospitals.map((hospital) => (
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

          {hospitals && hospitals.recommendedHospitals.length === 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs text-text-secondary">
                No hospitals found with an available {hospitals.specialist} specialist nearby. Try a different diagnosis or upload a clinical document.
              </p>
            </div>
          )}

          {(specialist || hospitals) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
              Clear Suggestions
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
