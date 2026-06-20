import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  FileText,
  PanelRightOpen,
  Pill,
  Stethoscope,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentsPanel } from "@/features/copilot/components/DocumentsPanel";
import { RiskIndicator } from "@/features/copilot/components/RiskIndicator";
import { SmartActions } from "@/features/copilot/components/SmartActions";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type {
  ChatMessage,
  PatientContext,
  PatientDocument,
  PatientSnapshot,
} from "@/features/copilot/types/copilot.types";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";
import { getUrgencyBadgeClass } from "@/features/copilot/utils/copilotUtils";
import { cn } from "@/lib/utils";

interface PatientInsightsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientContext: PatientContext | null;
  snapshot: PatientSnapshot | null;
  latestAssistantMessage?: ChatMessage;
}

export function PatientInsightsDrawer({
  open,
  onOpenChange,
  patientContext,
  snapshot,
  latestAssistantMessage,
}: PatientInsightsDrawerProps) {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
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
  }, [patientContext?.patientId]);

  useEffect(() => {
    const handleScrollDocuments = () => {
      onOpenChange(true);
      setTimeout(() => {
        documentsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    };

    window.addEventListener("copilot-scroll-documents", handleScrollDocuments);
    return () => window.removeEventListener("copilot-scroll-documents", handleScrollDocuments);
  }, [onOpenChange]);

  const diagnosis = snapshot?.primaryDiagnosis || patientContext?.diagnosis;
  const riskLevel = snapshot?.riskLevel || patientContext?.riskLevel;
  const specialist = snapshot?.recommendedSpecialist || patientContext?.recommendedSpecialist;
  const urgency = snapshot?.urgency || patientContext?.urgency;
  const confidence = snapshot?.confidence || patientContext?.aiConfidence;
  const aiFindings = snapshot?.aiFindings || patientContext?.aiFindings || [];
  const medications = snapshot?.medications || patientContext?.medications || [];

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-24 right-4 z-20 hidden gap-2 rounded-full border-primary/20 bg-white/90 shadow-lg backdrop-blur-md hover:bg-primary/5 lg:flex"
        aria-label="Open patient insights"
      >
        <PanelRightOpen className="h-4 w-4 text-primary" />
        Patient Insights
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:bg-black/10"
              onClick={() => onOpenChange(false)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-3">
                <h2 className="text-sm font-semibold text-text-primary">Patient Insights</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  aria-label="Close insights"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-5 p-4">
                  {!patientContext ? (
                    <p className="text-sm text-text-secondary">
                      Select a patient to view clinical insights.
                    </p>
                  ) : (
                    <>
                      <InsightSection title="Diagnosis">
                        <p className="text-sm font-medium text-text-primary">{diagnosis}</p>
                      </InsightSection>

                      {riskLevel && (
                        <InsightSection title="Risk Assessment">
                          <RiskIndicator level={riskLevel} confidence={confidence} />
                        </InsightSection>
                      )}

                      {medications.length > 0 && (
                        <InsightSection title="Medications" icon={Pill}>
                          <ul className="space-y-1">
                            {medications.map((med) => (
                              <li key={med} className="text-sm text-text-primary">
                                • {med}
                              </li>
                            ))}
                          </ul>
                        </InsightSection>
                      )}

                      {specialist && (
                        <InsightSection title="Specialist" icon={Stethoscope}>
                          <p className="text-sm font-medium text-text-primary">
                            {getSpecialistDisplayName(specialist)}
                          </p>
                        </InsightSection>
                      )}

                      {urgency && (
                        <InsightSection title="Urgency">
                          <Badge variant="outline" className={getUrgencyBadgeClass(urgency)}>
                            {urgency}
                          </Badge>
                        </InsightSection>
                      )}

                      {snapshot?.transferRecommendation && (
                        <InsightSection title="Transfer" icon={AlertTriangle}>
                          <p className="text-sm text-text-primary">
                            {snapshot.transferRecommendation}
                          </p>
                        </InsightSection>
                      )}

                      {patientContext.referralStatus && (
                        <InsightSection title="Referral Status">
                          <Badge variant="outline">{patientContext.referralStatus}</Badge>
                        </InsightSection>
                      )}

                      {patientContext.hospital && (
                        <InsightSection title="Hospital" icon={Building2}>
                          <p className="text-sm text-text-primary">{patientContext.hospital}</p>
                        </InsightSection>
                      )}

                      {(aiFindings.length > 0 ||
                        (latestAssistantMessage?.evidence &&
                          latestAssistantMessage.evidence.length > 0)) && (
                        <InsightSection title="AI Findings" icon={FileText}>
                          <ul className="space-y-1.5 text-sm text-text-primary">
                            {(aiFindings.length > 0
                              ? aiFindings
                              : latestAssistantMessage?.evidence || []
                            )
                              .slice(0, 5)
                              .map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                                  {item}
                                </li>
                              ))}
                          </ul>
                        </InsightSection>
                      )}

                      <SmartActions
                        patientId={patientContext.patientId}
                        referralId={patientContext.referralId}
                        variant="drawer"
                      />

                      <DocumentsPanel
                        documents={documents}
                        isLoading={documentsLoading}
                        panelRef={documentsRef}
                      />
                    </>
                  )}
                </div>
              </ScrollArea>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function InsightSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-slate-50/80 p-3">
      <h4
        className={cn(
          "mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {title}
      </h4>
      {children}
    </div>
  );
}

export function PatientInsightsToggle({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      className={cn("gap-1.5 rounded-full border-primary/20 bg-white/80", className)}
    >
      <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
      Patient Insights
    </Button>
  );
}
