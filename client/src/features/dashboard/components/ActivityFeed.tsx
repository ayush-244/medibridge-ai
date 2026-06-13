import {
  Activity,
  BedDouble,
  Stethoscope,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/features/dashboard/components/DashboardSection";
import type { ActivityItem } from "@/features/dashboard/types/dashboard.types";

/**
 * TEMPORARY: Static placeholder data until GET /api/activities is integrated in a future phase.
 * Replace this array with a real API fetch when activity endpoint wiring is approved.
 */
const TEMPORARY_ACTIVITY_DATA: ActivityItem[] = [
  {
    id: "temp-1",
    action: "REFERRAL_ACCEPTED",
    description: "Referral accepted for patient transfer to City General",
    timestamp: "2 minutes ago",
    type: "referral",
  },
  {
    id: "temp-2",
    action: "BED_RESERVED",
    description: "ICU bed reserved at Metro Health Center",
    timestamp: "15 minutes ago",
    type: "reservation",
  },
  {
    id: "temp-3",
    action: "DOCTOR_ASSIGNED",
    description: "Dr. Patel assigned to incoming cardiology referral",
    timestamp: "32 minutes ago",
    type: "doctor",
  },
  {
    id: "temp-4",
    action: "RESERVATION_EXPIRED",
    description: "Bed reservation expired — capacity released",
    timestamp: "1 hour ago",
    type: "system",
  },
  {
    id: "temp-5",
    action: "REFERRAL_CREATED",
    description: "New referral created for orthopedic consultation",
    timestamp: "2 hours ago",
    type: "referral",
  },
];

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
  return (
    <DashboardSection
      title="Activity Feed"
      description="Recent system events and operational updates"
    >
      <div className="mb-4 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning">
        Temporary data — activity API integration pending (Phase 8).
      </div>

      <div className="space-y-1">
        {TEMPORARY_ACTIVITY_DATA.map((item) => {
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
                  <Badge variant={activityColors[item.type]} className="text-[10px]">
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
    </DashboardSection>
  );
}
