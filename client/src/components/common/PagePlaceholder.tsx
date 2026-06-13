import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PagePlaceholderProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function PagePlaceholder({
  title,
  description,
  icon,
}: PagePlaceholderProps) {
  return (
    <div className="page-container">
      <div className="mb-8">
        <h1>{title}</h1>
        <p className="mt-2 text-text-secondary">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {icon && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-medium">Coming in a future phase</h3>
          <p className="mt-2 max-w-md text-sm text-text-secondary">
            This page shell is ready. Feature implementation will be added in
            the next development phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
