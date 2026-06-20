import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatusIndicator } from "@/components/layout/ConnectionStatusIndicator";
import { PatientInsightsToggle } from "@/features/copilot/components/PatientInsightsDrawer";
import type { PatientContext } from "@/features/copilot/types/copilot.types";

interface CopilotHeaderProps {
  patientContext?: PatientContext | null;
  aiReady?: boolean;
  onOpenInsights?: () => void;
}

export function CopilotHeader({
  patientContext,
  aiReady = true,
  onOpenInsights,
}: CopilotHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="flex h-12 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600 shadow-sm">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="truncate text-sm font-semibold text-text-primary sm:text-base">
            Clinical Copilot
          </h1>
          {patientContext && (
            <span className="hidden truncate text-xs text-text-secondary sm:inline">
              · Patient:{" "}
              <span className="font-medium text-text-primary">
                {patientContext.patientId}
              </span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onOpenInsights && (
            <PatientInsightsToggle onClick={onOpenInsights} className="hidden sm:flex" />
          )}

          <Badge
            variant="outline"
            className={
              aiReady
                ? "border-emerald-200/80 bg-emerald-50/80 text-[10px] text-emerald-700 sm:text-xs"
                : "border-amber-200/80 bg-amber-50/80 text-[10px] text-amber-700 sm:text-xs"
            }
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                aiReady ? "bg-emerald-500" : "animate-pulse bg-amber-500"
              }`}
            />
            {aiReady ? "AI Ready" : "Processing"}
          </Badge>

          <ConnectionStatusIndicator />
        </div>
      </div>
    </header>
  );
}
