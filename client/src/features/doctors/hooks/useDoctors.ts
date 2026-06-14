import { useCallback, useEffect, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseDoctorsReturn {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
}

export function useDoctors(): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load doctors";
      if (!options?.silent) {
        setError(message);
        setDoctors([]);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchDoctors({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.DOCTOR_CREATED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.DOCTOR_UPDATED, debouncedRefetch);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, isLoading, error, refetch: fetchDoctors };
}
