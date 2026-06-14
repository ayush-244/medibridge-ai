import { useCallback, useEffect, useState } from "react";
import { reservationService } from "@/features/reservations/services/reservation.service";
import type { Reservation } from "@/features/reservations/types/reservation.types";

export function useReferralReservation(referralId: string | null, enabled: boolean) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReservation = useCallback(async () => {
    if (!referralId || !enabled) {
      setReservation(null);
      return;
    }

    setIsLoading(true);
    try {
      const reservations = await reservationService.getAll();
      const match = reservations.find((item) => {
        const refId =
          typeof item.referral === "string"
            ? item.referral
            : item.referral?._id;
        return refId === referralId;
      });
      setReservation(match ?? null);
    } catch {
      setReservation(null);
    } finally {
      setIsLoading(false);
    }
  }, [referralId, enabled]);

  useEffect(() => {
    void fetchReservation();
  }, [fetchReservation]);

  return { reservation, isLoading, refetch: fetchReservation };
}
