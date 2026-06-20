import { useCallback, useEffect, useRef, useState } from "react";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type { ClinicalIntelligence } from "@/features/copilot/types/copilot.types";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface UseClinicalIntelligenceOptions {
  patientId: string | null;
  enabled?: boolean;
}

export function useClinicalIntelligence({
  patientId,
  enabled = true,
}: UseClinicalIntelligenceOptions) {
  const [intelligence, setIntelligence] = useState<ClinicalIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPatientRef = useRef<string | null>(null);

  const loadIntelligence = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await copilotService.getClinicalIntelligence(id);
      setIntelligence(data);
      lastPatientRef.current = id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load intelligence");
      setIntelligence(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !patientId?.trim()) {
      setIntelligence(null);
      return;
    }

    if (lastPatientRef.current === patientId.trim()) return;

    void loadIntelligence(patientId.trim());
  }, [patientId, enabled, loadIntelligence]);

  useSocketEvent(
    SOCKET_EVENTS.RISK_ANALYSIS_GENERATED,
    (event) => {
      if (patientId && event.patientId === patientId) {
        void loadIntelligence(patientId);
      }
    },
    Boolean(patientId),
  );

  const reset = useCallback(() => {
    setIntelligence(null);
    setError(null);
    lastPatientRef.current = null;
  }, []);

  return { intelligence, isLoading, error, reset };
}
