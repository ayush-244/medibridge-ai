import {
  Activity,
  BedDouble,
  Clock,
  HeartPulse,
} from "lucide-react";
import { StatCard } from "@/components/analytics/StatCard";
import type { ReservationSummary } from "@/features/reservations/types/reservation.types";

interface ReservationSummaryCardsProps {
  summary: ReservationSummary;
  loading?: boolean;
}

export function ReservationSummaryCards({
  summary,
  loading = false,
}: ReservationSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Active Reservations"
        value={summary.active}
        icon={Activity}
        description="Currently confirmed"
        loading={loading}
      />
      <StatCard
        title="Expired Reservations"
        value={summary.expired}
        icon={Clock}
        description="Requires attention"
        loading={loading}
      />
      <StatCard
        title="ICU Reservations"
        value={summary.icu}
        icon={HeartPulse}
        description="Critical care beds"
        loading={loading}
      />
      <StatCard
        title="General Reservations"
        value={summary.general}
        icon={BedDouble}
        description="Standard ward beds"
        loading={loading}
      />
    </div>
  );
}
