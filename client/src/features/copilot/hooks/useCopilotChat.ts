import { useCallback, useEffect, useRef, useState } from "react";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type { ChatMessage, ChatSession } from "@/features/copilot/types/copilot.types";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface UseCopilotChatOptions {
  sessionId: string | null;
  onSessionUpdated?: (session: ChatSession) => void;
}

export function useCopilotChat({ sessionId, onSessionUpdated }: UseCopilotChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thinkingStage, setThinkingStage] = useState(0);
  const thinkingTimerRef = useRef<number | null>(null);

  const THINKING_STAGES = [
    "Analyzing medical records...",
    "Reviewing patient history...",
    "Searching clinical evidence...",
    "Generating response...",
  ];

  const loadSession = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await copilotService.getSession(id);
      setMessages(data.messages);
      onSessionUpdated?.(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSessionUpdated]);

  useEffect(() => {
    if (sessionId) {
      void loadSession(sessionId);
    } else {
      setMessages([]);
      setError(null);
    }
  }, [sessionId, loadSession]);

  useSocketEvent(
    SOCKET_EVENTS.COPILOT_RESPONSE_GENERATED,
    (event) => {
      if (sessionId && event.sessionId === sessionId) {
        void loadSession(sessionId);
      }
    },
    Boolean(sessionId),
  );

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
  }, [isSending, THINKING_STAGES.length]);

  const sendMessage = useCallback(
    async (question: string, overrideSessionId?: string) => {
      const targetSessionId = overrideSessionId || sessionId;
      if (!targetSessionId || !question.trim() || isSending) return;

      setIsSending(true);
      setError(null);

      const optimisticUserMessage: ChatMessage = {
        _id: `temp-${Date.now()}`,
        sessionId: targetSessionId,
        role: "user",
        content: question.trim(),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);

      try {
        const result = await copilotService.sendMessage(targetSessionId, question.trim());
        setMessages((prev) => [
          ...prev.filter((msg) => msg._id !== optimisticUserMessage._id),
          result.userMessage,
          result.assistantMessage,
        ]);
        onSessionUpdated?.(result.session);
      } catch (err) {
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== optimisticUserMessage._id),
        );
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, isSending, onSessionUpdated],
  );

  const regenerateLast = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isSending,
    error,
    thinkingStage,
    thinkingMessage: THINKING_STAGES[thinkingStage],
    sendMessage,
    regenerateLast,
    clearMessages,
    reload: () => sessionId && loadSession(sessionId),
  };
}
