import { useCallback, useEffect, useRef, useState } from "react";
import { copilotService } from "@/features/copilot/services/copilot.service";
import type { PatientSnapshot } from "@/features/copilot/types/copilot.types";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface UsePatientSnapshotOptions {
  patientId: string | null;
  enabled?: boolean;
}

export function usePatientSnapshot({ patientId, enabled = true }: UsePatientSnapshotOptions) {
  const [snapshot, setSnapshot] = useState<PatientSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPatientRef = useRef<string | null>(null);

  const loadSnapshot = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await copilotService.getPatientSnapshot(id);
      setSnapshot(data);
      lastPatientRef.current = id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load snapshot");
      setSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !patientId?.trim()) {
      setSnapshot(null);
      return;
    }

    if (lastPatientRef.current === patientId.trim()) return;

    void loadSnapshot(patientId.trim());
  }, [patientId, enabled, loadSnapshot]);

  useSocketEvent(
    SOCKET_EVENTS.PATIENT_SNAPSHOT_GENERATED,
    (event) => {
      if (patientId && event.patientId === patientId) {
        void loadSnapshot(patientId);
      }
    },
    Boolean(patientId),
  );

  const refresh = useCallback(() => {
    if (patientId?.trim()) {
      lastPatientRef.current = null;
      void loadSnapshot(patientId.trim());
    }
  }, [patientId, loadSnapshot]);

  const reset = useCallback(() => {
    setSnapshot(null);
    setError(null);
    lastPatientRef.current = null;
  }, []);

  return { snapshot, isLoading, error, refresh, reset };
}
