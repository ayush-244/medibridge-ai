import { Check, Clipboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReferralAutofillData } from "@/features/referral-autofill/types/referralAutofill.types";

interface ExtractionPreviewCardProps {
  data: ReferralAutofillData;
  onApply: () => void;
  onDiscard: () => void;
  isApplied: boolean;
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 text-sm">
      <span className="shrink-0 font-medium text-text-secondary">{label}</span>
      <span className="text-right">
        {value != null ? String(value) : <span className="italic text-text-secondary/60">Not found</span>}
      </span>
    </div>
  );
}

export function ExtractionPreviewCard({
  data,
  onApply,
  onDiscard,
  isApplied,
}: ExtractionPreviewCardProps) {
  const hasAnyData = Object.values(data).some((v) => v != null);

  if (!hasAnyData) {
    return (
      <div className="rounded-lg border border-border p-3">
        <p className="text-sm text-text-secondary">
          No structured patient information could be extracted from this document.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2 w-full gap-2"
          onClick={onDiscard}
        >
          <X className="h-4 w-4" />
          Dismiss
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Extracted Patient Information</h4>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
          AI Extracted
        </span>
      </div>

      <div className="divide-y divide-border">
        <FieldRow label="Name" value={data.patientName} />
        <FieldRow label="Age" value={data.age} />
        <FieldRow label="Gender" value={data.gender} />
        <FieldRow label="Diagnosis" value={data.diagnosis} />
        <FieldRow label="Condition" value={data.conditionSummary} />
        <FieldRow label="Priority" value={data.priority} />
        <FieldRow label="Specialty" value={data.requiredSpecialty} />
      </div>

      <div className="mt-3 space-y-2">
        {isApplied ? (
          <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-600">
            <Check className="h-4 w-4" />
            Applied to Form
          </div>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              className="w-full gap-2"
              onClick={onApply}
            >
              <Clipboard className="h-4 w-4" />
              Apply to Form
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={onDiscard}
            >
              <X className="h-4 w-4" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
