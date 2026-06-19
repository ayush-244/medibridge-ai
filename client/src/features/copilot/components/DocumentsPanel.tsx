import { useState, type RefObject } from "react";
import { FileCheck, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PatientDocument } from "@/features/copilot/types/copilot.types";
import { formatUploadDate } from "@/features/copilot/utils/copilotUtils";

interface DocumentsPanelProps {
  documents: PatientDocument[];
  isLoading?: boolean;
  panelRef?: RefObject<HTMLDivElement | null>;
}

export function DocumentsPanel({ documents, isLoading, panelRef }: DocumentsPanelProps) {
  const [selected, setSelected] = useState<PatientDocument | null>(null);

  return (
    <>
      <div ref={panelRef} className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="h-4 w-4 text-primary" />
          Documents
        </h3>

        {isLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        )}

        {!isLoading && documents.length === 0 && (
          <p className="text-sm text-text-secondary">No documents uploaded for this patient.</p>
        )}

        <ScrollArea className="max-h-48">
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.fileName}>
                <button
                  type="button"
                  onClick={() => setSelected(doc)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-white px-3 py-2 text-left text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  <FileCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="truncate font-medium text-text-primary">{doc.fileName}</span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Document Metadata</SheetTitle>
          </SheetHeader>
          {selected && (
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-text-secondary">File name</dt>
                <dd className="font-medium text-text-primary">{selected.fileName}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Upload date</dt>
                <dd className="font-medium text-text-primary">
                  {formatUploadDate(selected.uploadDate)}
                </dd>
              </div>
              <div>
                <dt className="text-text-secondary">Chunks stored</dt>
                <dd className="font-medium text-text-primary">{selected.chunkCount}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Patient ID</dt>
                <dd className="font-mono font-medium text-text-primary">{selected.patientId}</dd>
              </div>
            </dl>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
