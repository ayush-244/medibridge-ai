import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReferralDocumentUpload } from "@/features/referrals/hooks/useReferralDocumentUpload";

interface DocumentUploadSectionProps {
  referralId: string;
  onUploadComplete?: () => void;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function DocumentUploadSection({
  referralId,
  onUploadComplete,
}: DocumentUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    progress,
    isUploading,
    error,
    uploadedFileName,
    upload,
    reset,
  } = useReferralDocumentUpload(referralId);

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
    await upload(selectedFile);
    if (!error) {
      onUploadComplete?.();
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setValidationError(null);
    reset();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <h4 className="mb-3 text-sm font-semibold">Upload Clinical Document</h4>

      {!uploadedFileName && !isUploading && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!selectedFile ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full gap-2"
              onClick={() => inputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              Select PDF
            </Button>
          ) : (
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
                size="sm"
                className="w-full gap-2"
                onClick={() => void handleUpload()}
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </Button>
            </div>
          )}

          {validationError && (
            <p className="text-sm text-danger">{validationError}</p>
          )}
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading... {progress}%
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
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

      {error && !isUploading && (
        <p className="text-sm text-danger">{error}</p>
      )}

      <p className="mt-2 text-xs text-text-secondary">
        PDF only, max {MAX_SIZE_MB} MB. After upload, regenerate the AI recommendation above.
      </p>
    </div>
  );
}
