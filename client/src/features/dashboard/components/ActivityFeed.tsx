import {
  Activity,
  BedDouble,
  Loader2,
  RefreshCw,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/features/dashboard/components/DashboardSection";
import { useActivities } from "@/features/dashboard/hooks/useActivities";
import type { ActivityItem } from "@/features/dashboard/types/dashboard.types";

const activityIcons = {
  referral: UserCheck,
  reservation: BedDouble,
  doctor: Stethoscope,
  system: Activity,
};

const activityColors = {
  referral: "default" as const,
  reservation: "success" as const,
  doctor: "secondary" as const,
  system: "warning" as const,
};

export function ActivityFeed() {
  const { activities, isLoading, error, refetch } = useActivities();

  return (
    <DashboardSection
      title="Activity Feed"
      description="Recent system events and operational updates"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-secondary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="mt-3 text-sm">Loading activity...</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load activity"
          description={error}
          icon={<Activity className="h-6 w-6" />}
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : activities.length === 0 ? (
        <EmptyState
          title="No recent activity"
          description="System events will appear here as they happen."
          icon={<Activity className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-1">
          {activities.map((item: ActivityItem) => {
            const Icon = activityIcons[item.type];

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md px-2 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">
                      {item.description}
                    </p>
                    <Badge
                      variant={activityColors[item.type]}
                      className="text-[10px]"
                    >
                      {item.action.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardSection>
  );
}
