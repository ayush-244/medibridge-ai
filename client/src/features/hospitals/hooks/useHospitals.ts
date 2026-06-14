import { useCallback, useEffect, useState } from "react";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseHospitalsReturn {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
}

export function useHospitals(): UseHospitalsReturn {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await hospitalService.getAll();
      setHospitals(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load hospitals";
      if (!options?.silent) {
        setError(message);
        setHospitals([]);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchHospitals({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.HOSPITAL_UPDATED, debouncedRefetch);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return { hospitals, isLoading, error, refetch: fetchHospitals };
}
