import { useState, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";
import { DocumentPreviewModal } from "@/features/referrals/components/DocumentPreviewModal";
import { DocumentActionsMenu } from "@/features/referrals/components/DocumentActionsMenu";
import type { ReferralDocument } from "@/features/referrals/types/referral.types";

interface DocumentListProps {
  documents: ReferralDocument[];
  referralId: string;
  loading: boolean;
  onDelete: (documentId: string) => void;
  onReplace: (documentId: string, file: File) => Promise<void>;
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({
  documents,
  referralId,
  loading,
  onDelete,
  onReplace,
}: DocumentListProps) {
  const [previewDoc, setPreviewDoc] = useState<ReferralDocument | null>(null);

  const handleDelete = useCallback(
    (docId: string) => onDelete(docId),
    [onDelete],
  );

  const handleReplace = useCallback(
    async (docId: string, file: File) => {
      await onReplace(docId, file);
    },
    [onReplace],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FileText className="mb-2 h-8 w-8 text-text-secondary" />
        <p className="text-sm text-text-secondary">No documents uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border rounded-lg border border-border">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <button
              type="button"
              onClick={() => setPreviewDoc(doc)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium text-text-primary">
                {doc.originalFilename}
              </p>
              <p className="text-xs text-text-secondary">
                Uploaded {formatRelativeTime(doc.createdAt)}
                {doc.uploadedByName !== "System" && ` by ${doc.uploadedByName}`}
                {" \u00B7 "}
                {formatFileSize(doc.fileSize)}
              </p>
            </button>

            <DocumentActionsMenu
              document={doc}
              referralId={referralId}
              onDelete={() => handleDelete(doc._id)}
              onReplace={(file) => handleReplace(doc._id, file)}
            />
          </div>
        ))}
      </div>

      {previewDoc && (
        <DocumentPreviewModal
          document={previewDoc}
          referralId={referralId}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </>
  );
}
