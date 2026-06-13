import { Inbox } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardEmpty() {
  return (
    <div className="page-container">
      <Card className="mx-auto max-w-lg border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>No dashboard data available</CardTitle>
          <CardDescription>
            There is no operational data to display yet. Check back once
            hospitals, doctors, and referrals are configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6" />
      </Card>
    </div>
  );
}
