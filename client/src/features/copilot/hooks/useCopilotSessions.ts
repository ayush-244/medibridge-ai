import { useCallback, useEffect, useState } from "react";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type { ChatSession } from "@/features/copilot/types/copilot.types";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

export function useCopilotSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await copilotService.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useSocketEvent(SOCKET_EVENTS.COPILOT_SESSION_STARTED, () => {
    void fetchSessions();
  });

  useSocketEvent(SOCKET_EVENTS.COPILOT_RESPONSE_GENERATED, () => {
    void fetchSessions();
  });

  return {
    sessions,
    isLoading,
    error,
    refresh: fetchSessions,
  };
}
