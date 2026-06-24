import { useState, useRef, useEffect } from "react";
import { MoreVertical, Download, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { referralService } from "@/features/referrals/services/referral.service";
import type { ReferralDocument } from "@/features/referrals/types/referral.types";

interface DocumentActionsMenuProps {
  document: ReferralDocument;
  referralId: string;
  onDelete: () => void;
  onReplace: (file: File) => Promise<void>;
}

export function DocumentActionsMenu({
  document: doc,
  referralId,
  onDelete,
  onReplace,
}: DocumentActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const downloadUrl = referralService.getDocumentDownloadUrl(
    referralId,
    doc._id,
  );

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be 10 MB or smaller");
      return;
    }
    setReplacing(true);
    try {
      await onReplace(file);
      setOpen(false);
    } finally {
      setReplacing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleReplace}
      />
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-gray-100 hover:text-text-primary"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-40 min-w-[180px] overflow-hidden rounded-lg border border-border bg-white shadow-lg">
          {confirmDelete ? (
            <div className="px-3 py-2">
              <p className="mb-2 text-xs text-text-secondary">
                Delete {doc.originalFilename}? This cannot be undone.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                    setConfirmDelete(false);
                  }}
                  className="flex-1 rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-text-secondary hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="py-1">
              <a
                href={downloadUrl}
                download
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <Download className="h-4 w-4" />
                Download
              </a>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={replacing}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-gray-50 disabled:opacity-50"
              >
                {replacing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {replacing ? "Replacing..." : "Replace"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
