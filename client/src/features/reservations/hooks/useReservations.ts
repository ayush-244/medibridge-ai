import { useCallback, useEffect, useState } from "react";
import { reservationService } from "@/features/reservations/services/reservation.service";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load reservations";
      if (!options?.silent) {
        setError(message);
        setReservations([]);
        showErrorToast(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchReservations({ silent: true }),
    500,
  );

  useSocketEvent(SOCKET_EVENTS.BED_RESERVED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXPIRED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_EXTENDED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.RESERVATION_CANCELLED, debouncedRefetch);
  useSocketEvent(SOCKET_EVENTS.PATIENT_ARRIVED, debouncedRefetch);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  return {
    reservations,
    isLoading,
    error,
    refetch: fetchReservations,
  };
}
