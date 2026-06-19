import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Pill,
  Stethoscope,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DocumentsPanel } from "@/features/copilot/components/DocumentsPanel";
import { RiskIndicator } from "@/features/copilot/components/RiskIndicator";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type {
  ChatMessage,
  PatientContext,
  PatientDocument,
} from "@/features/copilot/types/copilot.types";
import { recommendationService } from "@/features/ai-recommendations/services/recommendation.service";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";

interface CopilotInsightsPanelProps {
  patientContext: PatientContext | null;
  latestAssistantMessage?: ChatMessage;
  forceVisible?: boolean;
}

export function CopilotInsightsPanel({
  patientContext,
  latestAssistantMessage,
  forceVisible = false,
}: CopilotInsightsPanelProps) {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [specialist, setSpecialist] = useState<string | null>(null);
  const documentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!patientContext?.patientId) {
      setDocuments([]);
      return;
    }

    setDocumentsLoading(true);
    void copilotService
      .getDocuments(patientContext.patientId)
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setDocumentsLoading(false));

    void recommendationService
      .recommendSpecialist({ patient_id: patientContext.patientId })
      .then((result) => setSpecialist(result.specialist))
      .catch(() => setSpecialist(null));
  }, [patientContext?.patientId]);

  useEffect(() => {
    const handleScrollDocuments = () => {
      documentsRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    window.addEventListener("copilot-scroll-documents", handleScrollDocuments);
    return () => window.removeEventListener("copilot-scroll-documents", handleScrollDocuments);
  }, []);

  if (!patientContext) {
    return (
      <aside
        className={`h-full w-80 flex-col border-l border-border/60 bg-white/60 p-4 backdrop-blur-sm ${
          forceVisible ? "flex" : "hidden xl:flex"
        }`}
      >
        <p className="text-sm text-text-secondary">
          Select a patient to view clinical insights.
        </p>
      </aside>
    );
  }

  const confidence = latestAssistantMessage?.confidence;

  return (
    <aside
      className={`h-full w-80 flex-col border-l border-border/60 bg-white/60 backdrop-blur-sm ${
        forceVisible ? "flex" : "hidden xl:flex"
      }`}
    >
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-5">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">Patient Insights</h3>

            <div className="space-y-3 rounded-xl border border-border/60 bg-white p-4 shadow-sm">
              <div>
                <p className="text-xs text-text-secondary">Diagnosis</p>
                <p className="text-sm font-medium text-text-primary">{patientContext.diagnosis}</p>
              </div>

              <RiskIndicator level={patientContext.riskLevel} confidence={confidence} />

              {specialist && (
                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary">Recommended Specialist</p>
                    <p className="text-sm font-medium text-text-primary">
                      {getSpecialistDisplayName(specialist)}
                    </p>
                  </div>
                </div>
              )}

              {patientContext.hospital && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-text-secondary">Hospital</p>
                    <p className="text-sm font-medium text-text-primary">{patientContext.hospital}</p>
                  </div>
                </div>
              )}

              {patientContext.referralStatus && (
                <div>
                  <p className="text-xs text-text-secondary">Referral Status</p>
                  <Badge variant="outline" className="mt-1">
                    {patientContext.referralStatus}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {latestAssistantMessage?.evidence && latestAssistantMessage.evidence.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-white p-4 shadow-sm">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Recent Findings
              </h4>
              <ul className="space-y-1.5 text-sm text-text-primary">
                {latestAssistantMessage.evidence.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <DocumentsPanel
            documents={documents}
            isLoading={documentsLoading}
            panelRef={documentsRef}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}
