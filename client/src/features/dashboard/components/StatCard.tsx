import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="border-border transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
          </div>
          <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group border-border transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-semibold tracking-tight text-text-primary">
              {value}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {(description || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trend.positive ? "text-success" : "text-text-secondary",
                )}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-text-secondary">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
