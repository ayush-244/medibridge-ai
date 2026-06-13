import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ResourceCard({ children, onClick, className }: ResourceCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Card
      className={cn(
        "group border-border transition-all duration-200 hover:border-primary/20 hover:shadow-md",
        onClick && "cursor-pointer text-left",
        className,
      )}
    >
      <Component
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className="w-full"
      >
        <CardContent className="p-5">{children}</CardContent>
      </Component>
    </Card>
  );
}

interface ResourceMetricProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function ResourceMetric({ label, value, highlight }: ResourceMetricProps) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-text-secondary">{label}</p>
      <p
        className={cn(
          "text-sm font-semibold",
          highlight ? "text-primary" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
