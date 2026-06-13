import { useCallback, useEffect, useState } from "react";
import { reservationService } from "@/features/reservations/services/reservation.service";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { showErrorToast } from "@/lib/toast";

interface UseReservationsReturn {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReservations(): UseReservationsReturn {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await reservationService.getAll();
      setReservations(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load reservations";
      setError(message);
      setReservations([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
