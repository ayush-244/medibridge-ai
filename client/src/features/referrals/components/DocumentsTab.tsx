import { useCallback, useEffect, useState } from "react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";
import { DocumentList } from "@/features/referrals/components/DocumentList";
import { DocumentUploadButton } from "@/features/referrals/components/DocumentUploadButton";
import { referralService } from "@/features/referrals/services/referral.service";
import type { ReferralDocument } from "@/features/referrals/types/referral.types";

interface DocumentsTabProps {
  referralId: string;
  open: boolean;
}

export function DocumentsTab({ referralId, open }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<ReferralDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await referralService.getDocuments(referralId);
      setDocuments(docs);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    if (open && referralId) {
      void loadDocuments();
    }
  }, [open, referralId, loadDocuments]);

  useSocketEvent(
    SOCKET_EVENTS.DOCUMENT_UPLOADED,
    (payload) => {
      if (payload.referralId === referralId) void loadDocuments();
    },
    open,
  );

  useSocketEvent(
    SOCKET_EVENTS.DOCUMENT_DELETED,
    (payload) => {
      if (payload.referralId === referralId) void loadDocuments();
    },
    open,
  );

  useSocketEvent(
    SOCKET_EVENTS.DOCUMENT_REPLACED,
    (payload) => {
      if (payload.referralId === referralId) void loadDocuments();
    },
    open,
  );

  const handleUpload = useCallback(
    async (file: File) => {
      await referralService.uploadDocument(referralId, file);
      await loadDocuments();
    },
    [referralId, loadDocuments],
  );

  const handleDelete = useCallback(
    async (documentId: string) => {
      await referralService.deleteDocument(referralId, documentId);
      setDocuments((prev) => prev.filter((d) => d._id !== documentId));
    },
    [referralId],
  );

  const handleReplace = useCallback(
    async (documentId: string, file: File) => {
      await referralService.replaceDocument(referralId, documentId, file);
      await loadDocuments();
    },
    [referralId, loadDocuments],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </p>
        <DocumentUploadButton onUpload={handleUpload} />
      </div>

      <DocumentList
        documents={documents}
        referralId={referralId}
        loading={loading}
        onDelete={handleDelete}
        onReplace={handleReplace}
      />
    </div>
  );
}
