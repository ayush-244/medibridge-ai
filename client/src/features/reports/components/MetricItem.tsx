import { cn } from "@/lib/utils";

interface MetricItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function MetricItem({ label, value, highlight }: MetricItemProps) {
  return (
    <div className="rounded-lg border border-border bg-gray-50/50 px-4 py-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold",
          highlight ? "text-primary" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

interface MetricsRowProps {
  metrics: MetricItemProps[];
  columns?: 2 | 3 | 4 | 5;
}

export function MetricsRow({ metrics, columns = 4 }: MetricsRowProps) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  };

  return (
    <div className={cn("grid grid-cols-1 gap-3", colClass[columns])}>
      {metrics.map((m) => (
        <MetricItem key={m.label} {...m} />
      ))}
    </div>
  );
}
