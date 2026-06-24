import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CopilotProvider, useCopilot } from "@/features/copilot/context/CopilotContext";
import { ChatMessageList } from "@/features/copilot/components/ChatMessageList";
import { ChatInput } from "@/features/copilot/components/ChatInput";
import { DocumentsPanel } from "@/features/copilot/components/DocumentsPanel";
import { PatientSnapshotCard } from "@/features/copilot/components/PatientSnapshotCard";
import type { CopilotReferralContext } from "@/features/copilot/types/copilot.types";
import { getRiskBadgeClass } from "@/features/copilot/utils/copilotUtils";
import { cn } from "@/lib/utils";

interface CopilotSlideOverProps {
  open: boolean;
  referralContext: CopilotReferralContext;
  onClose: () => void;
}

export function CopilotSlideOver({
  open,
  referralContext,
  onClose,
}: CopilotSlideOverProps) {
  return (
    <CopilotProvider
      mode="referral"
      referralContext={referralContext}
      onClose={onClose}
    >
      <CopilotSlideOverInner open={open} onClose={onClose} />
    </CopilotProvider>
  );
}

function CopilotSlideOverInner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    messages,
    isSending,
    isCreatingSession,
    snapshot,
    snapshotLoading,
    sendMessage,
    error,
    thinkingMessage,
    patientContext,
    referralContext,
  } = useCopilot();

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = messages.length > 0;
  const chatDisabled = isSending || isCreatingSession;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600 shadow-sm">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Clinical Copilot
                </h2>
                {referralContext && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-primary/20 bg-primary/5 text-xs"
                  >
                    {referralContext.patientName}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close copilot"
              >
                <X className="h-4 w-4" />
              </Button>
            </header>

            {patientContext && (
              <div className="shrink-0 border-b border-white/40 bg-white/50 px-4 py-2">
                <div className="flex items-center gap-3 text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">{patientContext.patientName}</span>
                  {patientContext.age && <span>Age {patientContext.age}</span>}
                  {patientContext.gender && <span>{patientContext.gender}</span>}
                  {patientContext.sourceHospital && (
                    <span className="truncate">{patientContext.sourceHospital}</span>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", getRiskBadgeClass(patientContext.riskLevel))}
                  >
                    {patientContext.riskLevel}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {patientContext.diagnosis}
                </p>
              </div>
            )}

            <div className="flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                {error && (
                  <div className="mx-4 mt-2 shrink-0 rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {isCreatingSession && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-secondary">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Starting conversation...
                  </div>
                )}

                <ScrollArea className="min-h-0 flex-1">
                  <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-5">
                    {hasMessages && (
                      <ChatMessageList
                        messages={messages}
                        isSending={isSending}
                        thinkingMessage={thinkingMessage}
                      />
                    )}

                    {!hasMessages && !isCreatingSession && (
                      <div className="flex flex-col items-center gap-3 py-8 text-center">
                        <p className="text-sm text-text-secondary">
                          I have analyzed the referral. How can I help?
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {[
                            { label: "Summarize Patient", question: "Summarize this patient's medical records." },
                            { label: "Recommend Specialist", question: "Which specialist is recommended?" },
                            { label: "Explain Diagnosis", question: "Explain the diagnosis in detail." },
                          ].map((action) => (
                            <Button
                              key={action.label}
                              variant="secondary"
                              size="sm"
                              className="rounded-full border-primary/20 bg-white/80 text-xs"
                              onClick={() => void sendMessage(action.question)}
                              disabled={chatDisabled}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <ChatInput
                  inputRef={chatInputRef}
                  onSend={(question) => void sendMessage(question)}
                  disabled={chatDisabled}
                />
              </div>

              <aside className="hidden w-72 shrink-0 border-l border-white/40 bg-white/50 p-4 lg:block">
                <ScrollArea className="h-full">
                  <div className="space-y-5">
                    <PatientSnapshotCard
                      snapshot={snapshot}
                      isLoading={snapshotLoading}
                    />
                    <DocumentsPanel />
                  </div>
                </ScrollArea>
              </aside>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
