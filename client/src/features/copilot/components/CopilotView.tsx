import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CopilotHeader } from "@/features/copilot/components/CopilotHeader";
import { CopilotSidebar } from "@/features/copilot/components/CopilotSidebar";
import { PatientInsightsDrawer } from "@/features/copilot/components/PatientInsightsDrawer";
import { PatientContextBar } from "@/features/copilot/components/PatientContextBar";
import { PatientSnapshotCard } from "@/features/copilot/components/PatientSnapshotCard";
import { CopilotEmptyState } from "@/features/copilot/components/CopilotEmptyState";
import { ChatMessageList } from "@/features/copilot/components/ChatMessageList";
import { ChatInput } from "@/features/copilot/components/ChatInput";
import { useCopilotChat } from "@/features/copilot/hooks/useCopilotChat";
import { useCopilotSessions } from "@/features/copilot/hooks/useCopilotSessions";
import { usePatientSnapshot } from "@/features/copilot/hooks/usePatientSnapshot";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type { ChatSession, PatientContext } from "@/features/copilot/types/copilot.types";
import { referralService } from "@/features/referrals/services/referral.service";
import type { Referral, ReferralHospital } from "@/features/referrals/types/referral.types";

function resolveHospitalName(hospital: ReferralHospital | string): string {
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

const DEFAULT_PATIENT_ID = "PATIENT002";

export function CopilotView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientIdParam = searchParams.get("patient_id")?.trim() || "";
  const referralIdParam = searchParams.get("referral_id")?.trim() || "";
  const sessionIdParam = searchParams.get("session_id")?.trim() || "";

  const [patientId, setPatientId] = useState(patientIdParam || DEFAULT_PATIENT_ID);
  const [referralIdInput] = useState(referralIdParam);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    sessionIdParam || null,
  );
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

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
    clearMessages,
  } = useCopilotChat({
    sessionId: activeSessionId,
    onSessionUpdated: handleSessionUpdated,
  });

  const effectivePatientId =
    activeSession?.patientId || patientIdParam || patientId;

  const {
    snapshot,
    isLoading: snapshotLoading,
    reset: resetSnapshot,
  } = usePatientSnapshot({
    patientId: effectivePatientId,
    enabled: Boolean(effectivePatientId),
  });

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
      snapshot?.primaryDiagnosis ||
      activeSession?.condition ||
      referral?.condition ||
      "Clinical records under review";

    return {
      patientId: effectivePatientId,
      patientName:
        activeSession?.patientName ||
        referral?.patientName ||
        effectivePatientId,
      age: referral?.age ?? (effectivePatientId === "PATIENT002" ? 58 : undefined),
      gender: effectivePatientId === "PATIENT002" ? "Male" : undefined,
      diagnosis,
      riskLevel: snapshot?.riskLevel || "MEDIUM",
      hospital: referral ? resolveHospitalName(referral.toHospital) : "AIIMS Mangalagiri",
      referralStatus: referral?.status,
      referralId: referral?._id || referralIdParam || referralIdInput || undefined,
      urgency: snapshot?.urgency,
      transferRecommendation: snapshot?.transferRecommendation,
      recommendedSpecialist: snapshot?.recommendedSpecialist,
      medications: snapshot?.medications,
      aiConfidence: snapshot?.confidence,
      aiFindings: snapshot?.aiFindings,
    };
  }, [
    effectivePatientId,
    snapshot,
    activeSession,
    referral,
    referralIdParam,
    referralIdInput,
  ]);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((msg) => msg.role === "assistant"),
    [messages],
  );

  const updateUrl = useCallback(
    (params: { patientId?: string; referralId?: string; sessionId?: string | null }) => {
      const next = new URLSearchParams(searchParams);

      if (params.patientId) next.set("patient_id", params.patientId);
      if (params.referralId) next.set("referral_id", params.referralId);

      if (params.sessionId === null) {
        next.delete("session_id");
      } else if (params.sessionId) {
        next.set("session_id", params.sessionId);
      }

      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const focusInput = useCallback(() => {
    setTimeout(() => chatInputRef.current?.focus(), 50);
  }, []);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;

    const resolvedPatientId = patientId.trim();
    if (!resolvedPatientId) {
      toast.error("Enter a patient ID to start.");
      return null;
    }

    setIsCreatingSession(true);

    try {
      const session = await copilotService.createSession({
        patientId: resolvedPatientId,
        referralId: referralIdInput || undefined,
        patientName: referral?.patientName,
        condition: snapshot?.primaryDiagnosis || referral?.condition,
      });

      setActiveSessionId(session._id);
      setActiveSession(session);
      updateUrl({
        patientId: resolvedPatientId,
        referralId: referralIdInput || undefined,
        sessionId: session._id,
      });
      await refreshSessions();
      return session._id;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start session");
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [
    activeSessionId,
    patientId,
    referralIdInput,
    referral,
    snapshot,
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
        setPatientId(session.patientId);
        resetSnapshot();
        updateUrl({
          patientId: session.patientId,
          referralId: session.referralId,
          sessionId,
        });
      }
      setMobileSidebarOpen(false);
    },
    [sessions, updateUrl, resetSnapshot],
  );

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setActiveSession(null);
    clearMessages();
    updateUrl({ patientId, sessionId: null });
    focusInput();
  }, [clearMessages, updateUrl, patientId, focusInput]);

  const handlePatientChange = useCallback(
    (nextPatientId: string) => {
      setPatientId(nextPatientId);
      setActiveSessionId(null);
      setActiveSession(null);
      clearMessages();
      resetSnapshot();
      updateUrl({ patientId: nextPatientId, sessionId: null });
    },
    [clearMessages, resetSnapshot, updateUrl],
  );

  const hasMessages = messages.length > 0;
  const showEmptyState = !hasMessages && !messagesLoading && !isSending;
  const chatDisabled = isSending || isCreatingSession || !effectivePatientId;

  const snapshotCard = (
    <PatientSnapshotCard
      snapshot={snapshot}
      isLoading={snapshotLoading}
      patientId={effectivePatientId}
      referralId={patientContext?.referralId}
    />
  );

  const sidebarProps = {
    sessions,
    activeSessionId,
    patientId,
    isLoading: sessionsLoading,
    onSelectSession: handleSelectSession,
    onNewSession: handleNewSession,
    onQuickAction: (question: string) => void handleAsk(question),
    onPatientChange: handlePatientChange,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100dvh-theme(spacing.navbar))] flex-col overflow-hidden bg-gradient-to-br from-slate-50/80 via-white to-sky-50/40"
    >
      <CopilotHeader
        patientContext={patientContext}
        aiReady={!isSending && !snapshotLoading}
        onOpenInsights={() => setInsightsOpen(true)}
      />

      {patientContext && <PatientContextBar context={patientContext} />}

      <div className="flex min-h-0 flex-1">
        <div className="hidden min-h-0 lg:flex">
          <CopilotSidebar {...sidebarProps} />
        </div>

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs shadow-2xl">
              <CopilotSidebar {...sidebarProps} />
            </div>
          </div>
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col lg:w-[80%]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/40 px-3 py-2 lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <span className="truncate text-xs font-medium text-text-primary">
              {patientContext?.patientId || "Clinical Copilot"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInsightsOpen(true)}
              aria-label="Open insights"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </div>

          {chatError && (
            <div className="mx-4 mt-2 shrink-0 rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-700">
              {chatError}
            </div>
          )}

          {showEmptyState ? (
            <CopilotEmptyState
              onQuickStart={(question) => void handleAsk(question)}
              disabled={chatDisabled}
              snapshotContent={snapshotCard}
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
              headerContent={snapshotCard}
            />
          )}

          <ChatInput
            inputRef={chatInputRef}
            onSend={(question) => void handleAsk(question)}
            disabled={chatDisabled}
          />
        </main>
      </div>

      <PatientInsightsDrawer
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        patientContext={patientContext}
        snapshot={snapshot}
        latestAssistantMessage={latestAssistantMessage}
      />
    </motion.div>
  );
}
