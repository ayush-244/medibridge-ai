import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { referralService } from "@/features/referrals/services/referral.service";
import type { ReferralDocument } from "@/features/referrals/types/referral.types";

interface DocumentPreviewModalProps {
  document: ReferralDocument;
  referralId: string;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document: doc,
  referralId,
  onClose,
}: DocumentPreviewModalProps) {
  const downloadUrl = referralService.getDocumentDownloadUrl(
    referralId,
    doc._id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="flex h-[90vh] w-[90vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-text-primary">
              {doc.originalFilename}
            </h3>
            <p className="text-xs text-text-secondary">
              {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={() => window.open(downloadUrl, "_blank")}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 items-center justify-center bg-gray-100">
          <embed
            src={downloadUrl}
            type="application/pdf"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
