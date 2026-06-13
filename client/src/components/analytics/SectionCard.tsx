import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("border-border shadow-card", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
