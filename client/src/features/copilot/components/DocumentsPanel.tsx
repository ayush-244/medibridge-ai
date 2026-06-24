import { useRef } from "react";
import {
  FileCheck,
  FileText,
  Loader2,
  ChevronDown,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopilot } from "@/features/copilot/context/CopilotContext";

export function DocumentsPanel() {
  const { documents, documentsLoading, documentsHasMore, loadMoreDocuments } =
    useCopilot();

  const panelRef = useRef<HTMLDivElement>(null);

  if (documentsLoading && documents.length === 0) {
    return (
      <div ref={panelRef} className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="h-4 w-4 text-primary" />
          Documents
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div ref={panelRef} className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <FileText className="h-4 w-4 text-primary" />
          Documents
        </h3>
        <p className="text-sm text-text-secondary">No documents uploaded for this patient.</p>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <FileText className="h-4 w-4 text-primary" />
        Documents
        <span className="text-xs font-normal text-text-secondary">
          ({documents.length})
        </span>
      </h3>

      <ScrollArea className="max-h-48">
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.fileName}>
              <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-white px-3 py-2 text-left text-sm transition-all hover:border-primary/30 hover:bg-primary/5">
                <FileCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="flex-1 truncate font-medium text-text-primary">
                  {doc.fileName}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-text-secondary hover:bg-primary/10 hover:text-primary"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-text-secondary hover:bg-primary/10 hover:text-primary"
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>

      {documentsHasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={loadMoreDocuments}
          disabled={documentsLoading}
        >
          {documentsLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          Load More
        </Button>
      )}
    </div>
  );
}
