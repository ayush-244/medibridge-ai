import { useCallback, useState } from "react";
import { reservationService } from "@/features/reservations/services/reservation.service";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { showErrorToast } from "@/lib/toast";
import { SOCKET_EVENTS } from "@/types/socket";

interface UseReservationDetailReturn {
  reservation: Reservation | null;
  isLoading: boolean;
  fetchReservation: (id: string) => Promise<void>;
  clearReservation: () => void;
}

export function useReservationDetail(): UseReservationDetailReturn {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservation = useCallback(async (id: string) => {
    setIsLoading(true);

    try {
      const data = await reservationService.getById(id);
      setReservation(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load reservation details";
      setReservation(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearReservation = useCallback(() => {
    setReservation(null);
  }, []);

  useSocketEvent(
    SOCKET_EVENTS.DOCTOR_UPDATED,
    () => {
      if (reservation?._id) {
        void fetchReservation(reservation._id);
      }
    },
    Boolean(reservation?._id),
  );

  return { reservation, isLoading, fetchReservation, clearReservation };
}
