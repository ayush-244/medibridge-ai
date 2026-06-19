import type { HospitalMatchBreakdown } from "@/types/recommendation.types";

interface BreakdownItemProps {
  label: string;
  value: number;
  max: number;
}

function BreakdownItem({ label, value, max }: BreakdownItemProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text-primary">{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface RecommendationBreakdownProps {
  breakdown: HospitalMatchBreakdown;
}

export function RecommendationBreakdown({
  breakdown,
}: RecommendationBreakdownProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Score Breakdown
      </p>
      <BreakdownItem
        label="Specialist Score"
        value={breakdown.specialistScore}
        max={40}
      />
      <BreakdownItem
        label="Doctor Capacity Score"
        value={breakdown.doctorCapacityScore}
        max={25}
      />
      <BreakdownItem
        label="Bed Score"
        value={breakdown.bedScore}
        max={20}
      />
      <BreakdownItem
        label="Distance Score"
        value={breakdown.distanceScore}
        max={15}
      />
    </div>
  );
}
