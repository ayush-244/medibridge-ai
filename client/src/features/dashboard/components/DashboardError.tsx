import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardErrorProps {
  message?: string;
  onRetry: () => void;
}

export function DashboardError({
  message = "Failed to load dashboard.",
  onRetry,
}: DashboardErrorProps) {
  return (
    <div className="page-container">
      <Card className="mx-auto max-w-lg border-danger/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <AlertCircle className="h-6 w-6 text-danger" />
          </div>
          <CardTitle>Unable to load dashboard</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
