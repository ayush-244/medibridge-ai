import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function DashboardSection({
  title,
  description,
  children,
  action,
}: DashboardSectionProps) {
  return (
    <Card className="border-border shadow-card">
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
