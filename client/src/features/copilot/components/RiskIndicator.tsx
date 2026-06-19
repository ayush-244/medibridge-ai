import type { RiskLevel } from "@/features/copilot/types/copilot.types";
import { getRiskColor } from "@/features/copilot/utils/copilotUtils";

interface RiskIndicatorProps {
  level: RiskLevel;
  confidence?: number;
}

export function RiskIndicator({ level, confidence }: RiskIndicatorProps) {
  const progress =
    level === "CRITICAL"
      ? 100
      : level === "HIGH"
        ? 85
        : level === "MEDIUM"
          ? 55
          : 25;

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">Risk Level</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${getRiskColor(level)}`}
        >
          {level}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getRiskColor(level)}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {confidence !== undefined && (
        <p className="text-xs text-text-secondary">
          Confidence <span className="font-semibold text-text-primary">{confidence}%</span>
        </p>
      )}
    </div>
  );
}
