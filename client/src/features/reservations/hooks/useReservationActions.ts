import { useCallback, useState } from "react";
import { reservationService } from "@/features/reservations/services/reservation.service";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import type { ReservationDuration } from "@/lib/constants";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function useReservationActions() {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const markArrived = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const reservation = await reservationService.markArrived(id);
      showSuccessToast("Patient marked as arrived");
      return reservation;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message ||
          "Failed to mark patient as arrived",
      );
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const extendReservation = useCallback(
    async (id: string, durationHours: ReservationDuration) => {
      setIsActionLoading(true);
      try {
        const reservation = await reservationService.extend(id, durationHours);
        showSuccessToast(`Reservation extended by ${durationHours} hour(s)`);
        return reservation;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message ||
            "Failed to extend reservation",
        );
        return null;
      } finally {
        setIsActionLoading(false);
      }
    },
    [],
  );

  const cancelReservation = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const reservation = await reservationService.cancel(id);
      showSuccessToast("Reservation cancelled");
      return reservation;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to cancel reservation",
      );
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const completeReservation = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const reservation = await reservationService.complete(id);
      showSuccessToast("Reservation completed");
      return reservation;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message ||
          "Failed to complete reservation",
      );
      return null;
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  return {
    isActionLoading,
    markArrived,
    extendReservation,
    cancelReservation,
    completeReservation,
  };
}

export type { Reservation };
