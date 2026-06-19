import { Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatusIndicator } from "@/components/layout/ConnectionStatusIndicator";
import type { PatientContext } from "@/features/copilot/types/copilot.types";

interface CopilotHeaderProps {
  patientContext?: PatientContext | null;
  aiReady?: boolean;
}

export function CopilotHeader({ patientContext, aiReady = true }: CopilotHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary">
                MediBridge Clinical Copilot
              </h1>
              <p className="text-xs text-text-secondary">
                AI-powered clinical intelligence for patient referrals and medical records
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {patientContext && (
            <Badge variant="outline" className="font-mono text-xs">
              {patientContext.patientId}
            </Badge>
          )}

          <Badge
            variant="outline"
            className={
              aiReady
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          >
            <span
              className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                aiReady ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {aiReady ? "AI Ready" : "Processing"}
          </Badge>

          <ConnectionStatusIndicator />
        </div>
      </div>

      {patientContext && (
        <div className="flex flex-wrap gap-4 border-t border-border/40 px-4 py-2 text-xs text-text-secondary">
          {patientContext.patientName && (
            <span>
              Patient: <strong className="text-text-primary">{patientContext.patientName}</strong>
            </span>
          )}
          {patientContext.hospital && (
            <span>
              Hospital: <strong className="text-text-primary">{patientContext.hospital}</strong>
            </span>
          )}
        </div>
      )}
    </header>
  );
}
