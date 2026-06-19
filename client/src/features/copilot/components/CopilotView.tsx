import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, PanelRight, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopilotHeader } from "@/features/copilot/components/CopilotHeader";
import { CopilotSidebar } from "@/features/copilot/components/CopilotSidebar";
import { CopilotInsightsPanel } from "@/features/copilot/components/CopilotInsightsPanel";
import { PatientContextCard } from "@/features/copilot/components/PatientContextCard";
import { CopilotEmptyState } from "@/features/copilot/components/CopilotEmptyState";
import { ChatMessageList } from "@/features/copilot/components/ChatMessageList";
import { ChatInput } from "@/features/copilot/components/ChatInput";
import { useCopilotChat } from "@/features/copilot/hooks/useCopilotChat";
import { useCopilotSessions } from "@/features/copilot/hooks/useCopilotSessions";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type {
  ChatSession,
  PatientContext,
} from "@/features/copilot/types/copilot.types";
import { deriveRiskLevel } from "@/features/copilot/utils/copilotUtils";
import { referralService } from "@/features/referrals/services/referral.service";
import type { Referral, ReferralHospital } from "@/features/referrals/types/referral.types";

function resolveHospitalName(hospital: ReferralHospital | string): string {
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

export function CopilotView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patient_id")?.trim() || "";
  const referralIdParam = searchParams.get("referral_id")?.trim() || "";
  const sessionIdParam = searchParams.get("session_id")?.trim() || "";

  const [patientIdInput, setPatientIdInput] = useState(patientIdParam || "PATIENT002");
  const [referralIdInput, setReferralIdInput] = useState(referralIdParam);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionIdParam || null,
  );
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const { sessions, isLoading: sessionsLoading, refresh: refreshSessions } =
    useCopilotSessions();

  const handleSessionUpdated = useCallback((session: ChatSession) => {
    setActiveSession(session);
  }, []);

  const {
    messages,
    isLoading: messagesLoading,
    isSending,
    error: chatError,
    thinkingMessage,
    sendMessage,
    regenerateLast,
  } = useCopilotChat({
    sessionId: activeSessionId,
    onSessionUpdated: handleSessionUpdated,
  });

  const effectivePatientId =
    activeSession?.patientId || patientIdParam || patientIdInput;

  useEffect(() => {
    if (!referralIdParam && !referralIdInput) return;

    const referralId = referralIdParam || referralIdInput;
    void referralService
      .getAll()
      .then((referrals) => {
        const match = referrals.find((item) => item._id === referralId);
        if (match) setReferral(match);
      })
      .catch(() => setReferral(null));
  }, [referralIdParam, referralIdInput]);

  const patientContext = useMemo<PatientContext | null>(() => {
    if (!effectivePatientId) return null;

    const diagnosis =
      activeSession?.condition ||
      referral?.condition ||
      "Clinical records under review";

    const riskLevel = deriveRiskLevel(
      diagnosis,
      messages.filter((msg) => msg.role === "assistant").at(-1)?.confidence,
    );

    return {
      patientId: effectivePatientId,
      patientName:
        activeSession?.patientName ||
        referral?.patientName ||
        effectivePatientId,
      age: referral?.age,
      gender: effectivePatientId === "PATIENT002" ? "Male" : undefined,
      diagnosis,
      riskLevel,
      hospital: referral ? resolveHospitalName(referral.toHospital) : "AIIMS Mangalagiri",
      referralStatus: referral?.status,
      referralId: referral?._id || referralIdParam || referralIdInput || undefined,
    };
  }, [
    effectivePatientId,
    activeSession,
    referral,
    messages,
    referralIdParam,
    referralIdInput,
  ]);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((msg) => msg.role === "assistant"),
    [messages],
  );

  const updateUrl = useCallback(
    (params: { patientId?: string; referralId?: string; sessionId?: string }) => {
      const next = new URLSearchParams(searchParams);

      if (params.patientId) next.set("patient_id", params.patientId);
      if (params.referralId) next.set("referral_id", params.referralId);
      if (params.sessionId) next.set("session_id", params.sessionId);

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;

    const patientId = patientIdInput.trim();
    if (!patientId) {
      toast.error("Enter a patient ID to start.");
      return null;
    }

    setIsStarting(true);

    try {
      const session = await copilotService.createSession({
        patientId,
        referralId: referralIdInput || undefined,
        patientName: referral?.patientName,
        condition: referral?.condition,
      });

      setActiveSessionId(session._id);
      setActiveSession(session);
      updateUrl({
        patientId,
        referralId: referralIdInput || undefined,
        sessionId: session._id,
      });
      await refreshSessions();
      return session._id;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start session");
      return null;
    } finally {
      setIsStarting(false);
    }
  }, [
    activeSessionId,
    patientIdInput,
    referralIdInput,
    referral,
    updateUrl,
    refreshSessions,
  ]);

  const handleAsk = useCallback(
    async (question: string) => {
      const resolvedSessionId = await ensureSession();
      if (!resolvedSessionId) return;

      if (resolvedSessionId !== activeSessionId) {
        setActiveSessionId(resolvedSessionId);
      }

      await sendMessage(question, resolvedSessionId);
    },
    [ensureSession, activeSessionId, sendMessage],
  );

  useEffect(() => {
    const handleQuickAction = (event: Event) => {
      const detail = (event as CustomEvent<{ question: string }>).detail;
      if (detail?.question) {
        void handleAsk(detail.question);
      }
    };

    window.addEventListener("copilot-quick-action", handleQuickAction);
    return () => window.removeEventListener("copilot-quick-action", handleQuickAction);
  }, [handleAsk]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((item) => item._id === sessionId);
      setActiveSessionId(sessionId);
      setActiveSession(session || null);
      if (session) {
        setPatientIdInput(session.patientId);
        updateUrl({
          patientId: session.patientId,
          referralId: session.referralId,
          sessionId,
        });
      }
      setMobileSidebarOpen(false);
    },
    [sessions, updateUrl],
  );

  const handleStartPatient = async (event: React.FormEvent) => {
    event.preventDefault();
    await ensureSession();
  };

  const handleNewSession = () => {
    setActiveSessionId(null);
    setActiveSession(null);
    const next = new URLSearchParams(searchParams);
    next.delete("session_id");
    setSearchParams(next, { replace: true });
  };

  const hasMessages = messages.length > 0;
  const showEmptyState = !hasMessages && !messagesLoading && !isSending;
  const chatDisabled = isSending || isStarting || !effectivePatientId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100vh-theme(spacing.navbar))] flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50/30"
    >
      <CopilotHeader patientContext={patientContext} aiReady={!isSending} />

      {!activeSessionId && (
        <form
          onSubmit={(event) => void handleStartPatient(event)}
          className="flex flex-wrap items-end gap-3 border-b border-border/40 bg-white/70 px-4 py-3 backdrop-blur-sm"
        >
          <div className="min-w-[160px] flex-1 space-y-1">
            <label htmlFor="copilot-patient-id" className="text-xs font-medium text-text-secondary">
              Patient ID
            </label>
            <Input
              id="copilot-patient-id"
              value={patientIdInput}
              onChange={(event) => setPatientIdInput(event.target.value)}
              placeholder="e.g. PATIENT002"
              required
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <label htmlFor="copilot-referral-id" className="text-xs font-medium text-text-secondary">
              Referral ID (optional)
            </label>
            <Input
              id="copilot-referral-id"
              value={referralIdInput}
              onChange={(event) => setReferralIdInput(event.target.value)}
              placeholder="Link to referral workflow"
            />
          </div>
          <Button type="submit" disabled={isStarting}>
            Start Session
          </Button>
        </form>
      )}

      {patientContext && <PatientContextCard context={patientContext} />}

      <div className="relative flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <CopilotSidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            isLoading={sessionsLoading}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onQuickAction={(question) => void handleAsk(question)}
          />
        </div>

        {mobileSidebarOpen && (
          <div className="absolute inset-y-0 left-0 z-30 lg:hidden">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <CopilotSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              isLoading={sessionsLoading}
              onSelectSession={handleSelectSession}
              onNewSession={handleNewSession}
              onQuickAction={(question) => void handleAsk(question)}
            />
          </div>
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open conversations"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-text-primary">
              {patientContext?.patientId || "Clinical Copilot"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileInsightsOpen((prev) => !prev)}
              aria-label="Toggle insights"
            >
              {mobileInsightsOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <PanelRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {chatError && (
            <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {chatError}
            </div>
          )}

          {showEmptyState ? (
            <CopilotEmptyState
              onQuickStart={(question) => void handleAsk(question)}
              disabled={chatDisabled}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              patientId={effectivePatientId}
              referralId={patientContext?.referralId}
              isSending={isSending}
              thinkingMessage={thinkingMessage}
              onSuggestedQuestion={(question) => void handleAsk(question)}
              onRegenerate={() => void regenerateLast()}
            />
          )}

          <ChatInput
            onSend={(question) => void handleAsk(question)}
            disabled={chatDisabled}
          />
        </main>

        <CopilotInsightsPanel
          patientContext={patientContext}
          latestAssistantMessage={latestAssistantMessage}
        />

        {mobileInsightsOpen && (
          <div className="absolute inset-y-0 right-0 z-30 w-full max-w-sm xl:hidden">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setMobileInsightsOpen(false)}
            />
            <div className="relative h-full bg-white shadow-xl">
              <CopilotInsightsPanel
                patientContext={patientContext}
                latestAssistantMessage={latestAssistantMessage}
                forceVisible
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
