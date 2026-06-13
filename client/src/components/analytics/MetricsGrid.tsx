import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  className?: string;
}

const columnClasses = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

export function MetricsGrid({
  children,
  columns = 4,
  className,
}: MetricsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4",
        columnClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
