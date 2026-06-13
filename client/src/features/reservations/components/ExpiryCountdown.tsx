import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/lib/constants";
import { getExpiryCountdown } from "@/features/reservations/utils/reservationUtils";

interface ExpiryCountdownProps {
  expiresAt: string;
  status: ReservationStatus;
  now: number;
  className?: string;
}

export function ExpiryCountdown({
  expiresAt,
  status,
  now,
  className,
}: ExpiryCountdownProps) {
  const { label, isExpired, isUrgent } = getExpiryCountdown(
    expiresAt,
    status,
    now,
  );

  return (
    <span
      className={cn(
        "text-sm font-medium",
        isExpired && "text-danger",
        isUrgent && !isExpired && "text-warning",
        !isExpired && !isUrgent && "text-text-primary",
        className,
      )}
    >
      {label}
    </span>
  );
}
