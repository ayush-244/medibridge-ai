import type { MetricItem } from "@/features/dashboard/types/dashboard.types";

interface MetricRowsProps {
  metrics: MetricItem[];
}

export function MetricRows({ metrics }: MetricRowsProps) {
  return (
    <>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center justify-between border-b border-border py-3 last:border-0"
        >
          <span className="text-sm text-text-secondary">{metric.label}</span>
          <span
            className={
              metric.highlight
                ? "text-sm font-semibold text-primary"
                : "text-sm font-medium text-text-primary"
            }
          >
            {metric.value}
          </span>
        </div>
      ))}
    </>
  );
}
