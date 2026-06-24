import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { copilotService } from "@/features/copilot/services/copilot.service";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";
import type { CopilotReferralContext, CopilotMode } from "@/features/copilot/types/copilot.types";
import type {
  ChatMessage,
  ChatSession,
  PatientContext,
  PatientDocument,
  PatientSnapshot,
  RiskLevel,
} from "@/features/copilot/types/copilot.types";

interface CopilotContextValue {
  mode: CopilotMode;
  patientId: string;
  patientName: string;
  patientContext: PatientContext | null;
  referralContext: CopilotReferralContext | null;
  documents: PatientDocument[];
  documentsLoading: boolean;
  documentsHasMore: boolean;
  messages: ChatMessage[];
  isSending: boolean;
  isCreatingSession: boolean;
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  snapshot: PatientSnapshot | null;
  snapshotLoading: boolean;
  error: string | null;
  thinkingMessage: string;
  sendMessage: (text: string) => Promise<void>;
  loadMoreDocuments: () => Promise<void>;
  startNewChat: () => void;
  close: () => void;
}

const CopilotContext = createContext<CopilotContextValue | null>(null);

const THINKING_STAGES = [
  "Analyzing medical records...",
  "Reviewing patient history...",
  "Searching clinical evidence...",
  "Generating response...",
];

interface CopilotProviderProps {
  mode: CopilotMode;
  referralContext?: CopilotReferralContext | null;
  patientName?: string;
  patientId?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function CopilotProvider({
  mode,
  referralContext,
  patientName: patientNameProp,
  patientId: patientIdProp,
  children,
  onClose,
}: CopilotProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [snapshot, setSnapshot] = useState<PatientSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingStage, setThinkingStage] = useState(0);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsCursor, setDocumentsCursor] = useState(0);
  const [documentsHasMore, setDocumentsHasMore] = useState(false);
  const thinkingTimerRef = useRef<number | null>(null);

  const patientName =
    referralContext?.patientName || patientNameProp || "Patient";

  const patientContext = useMemo<PatientContext | null>(() => {
    if (!referralContext) return null;
    return {
      patientName: referralContext.patientName,
      age: referralContext.age,
      gender: referralContext.gender,
      diagnosis: referralContext.diagnosis,
      riskLevel: "MEDIUM" as RiskLevel,
      referralStatus: referralContext.status,
      referralId: referralContext.referralId,
      sourceHospital: referralContext.sourceHospital,
      destinationHospital: referralContext.destinationHospital,
    };
  }, [referralContext]);

  const patientId = patientIdProp || referralContext?.referralId || `doc-${Date.now()}`;

  useSocketEvent(
    SOCKET_EVENTS.COPILOT_RESPONSE_GENERATED,
    (event) => {
      if (activeSessionId && event.sessionId === activeSessionId) {
        void loadSession(activeSessionId);
      }
    },
    Boolean(activeSessionId),
  );

  useSocketEvent(
    SOCKET_EVENTS.PATIENT_SNAPSHOT_GENERATED,
    () => {
      if (patientId) {
        void loadSnapshot(patientId);
      }
    },
    Boolean(patientId),
  );

  const loadSession = useCallback(async (sessionId: string) => {
    try {
      const data = await copilotService.getSession(sessionId);
      setMessages(data.messages);
      setActiveSession(data.session);
    } catch {
      /* socket refresh, error handled by initial load */
    }
  }, []);

  const loadSnapshot = useCallback(async (pid: string) => {
    setSnapshotLoading(true);
    try {
      const data = await copilotService.getPatientSnapshot(pid);
      setSnapshot(data);
    } catch {
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  const loadDocuments = useCallback(async (cursor = 0) => {
    if (!patientId) return;
    setDocumentsLoading(true);
    try {
      const data = await copilotService.getDocuments(patientId, cursor);
      if (cursor === 0) {
        setDocuments(data.documents);
      } else {
        setDocuments((prev) => [...prev, ...data.documents]);
      }
      setDocumentsCursor(cursor + data.documents.length);
      setDocumentsHasMore(data.hasMore);
    } catch {
      if (cursor === 0) setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId && mode === "referral") {
      void loadDocuments(0);
      void loadSnapshot(patientId);
    }
  }, [patientId, mode, loadDocuments, loadSnapshot]);

  useEffect(() => {
    if (isSending) {
      setThinkingStage(0);
      thinkingTimerRef.current = window.setInterval(() => {
        setThinkingStage((prev) => (prev + 1) % THINKING_STAGES.length);
      }, 1800);
    } else if (thinkingTimerRef.current) {
      window.clearInterval(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    return () => {
      if (thinkingTimerRef.current) {
        window.clearInterval(thinkingTimerRef.current);
      }
    };
  }, [isSending]);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    if (activeSessionId) return activeSessionId;

    setIsCreatingSession(true);
    try {
      const session = await copilotService.createSession({
        patientId,
        referralId: referralContext?.referralId,
        patientName,
        condition: referralContext?.diagnosis,
      });
      setActiveSessionId(session._id);
      setActiveSession(session);
      return session._id;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start session");
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [activeSessionId, patientId, referralContext, patientName]);

  const sendMessage = useCallback(
    async (text: string) => {
      const sessionId = await ensureSession();
      if (!sessionId) return;

      if (sessionId !== activeSessionId) {
        setActiveSessionId(sessionId);
      }

      if (!text.trim() || isSending) return;

      setIsSending(true);
      setError(null);

      const optimisticUserMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        sessionId,
        role: "user",
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);

      try {
        const result = await copilotService.sendMessage(sessionId, text.trim());
        setMessages((prev) => [
          ...prev.filter((msg) => msg._id !== optimisticUserMessage._id),
          result.userMessage,
          result.assistantMessage,
        ]);
        setActiveSession(result.session);
      } catch (err) {
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticUserMessage._id));
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [ensureSession, activeSessionId, isSending],
  );

  const loadMoreDocuments = useCallback(async () => {
    if (!documentsLoading && documentsHasMore) {
      await loadDocuments(documentsCursor);
    }
  }, [documentsLoading, documentsHasMore, documentsCursor, loadDocuments]);

  const startNewChat = useCallback(() => {
    setActiveSessionId(null);
    setActiveSession(null);
    setMessages([]);
    setError(null);
  }, []);

  const value = useMemo<CopilotContextValue>(
    () => ({
      mode,
      patientId,
      patientName,
      patientContext,
      referralContext: referralContext ?? null,
      documents,
      documentsLoading,
      documentsHasMore,
      messages,
      isSending,
      isCreatingSession,
      activeSessionId,
      activeSession,
      snapshot,
      snapshotLoading,
      error,
      thinkingMessage: THINKING_STAGES[thinkingStage],
      sendMessage,
      loadMoreDocuments,
      startNewChat,
      close: onClose || (() => {}),
    }),
    [
      mode,
      patientName,
      patientContext,
      referralContext,
      documents,
      documentsLoading,
      documentsHasMore,
      messages,
      isSending,
      isCreatingSession,
      activeSessionId,
      activeSession,
      snapshot,
      snapshotLoading,
      error,
      thinkingStage,
      sendMessage,
      loadMoreDocuments,
      startNewChat,
      onClose,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error("useCopilot must be used within a CopilotProvider");
  }
  return ctx;
}
