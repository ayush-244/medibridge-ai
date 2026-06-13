import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-border border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon ?? <Inbox className="h-6 w-6" />}
        </div>
        <h3 className="text-lg font-medium text-text-primary">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
