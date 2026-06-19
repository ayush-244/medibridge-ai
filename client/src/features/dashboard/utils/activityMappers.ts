import type { ActivityItem } from "@/features/dashboard/types/dashboard.types";
import type { ActivityLog } from "@/features/dashboard/types/activity.types";
import { formatRelativeTime } from "@/features/referrals/utils/referralUtils";

function resolveActivityType(
  log: ActivityLog,
): ActivityItem["type"] {
  const action = log.action.toUpperCase();
  const entity = log.entityType.toLowerCase();

  if (
    action.includes("COPILOT") ||
    entity.includes("chatsession")
  ) {
    return "system";
  }

  if (
    action.includes("REFERRAL") ||
    entity.includes("referral")
  ) {
    return "referral";
  }

  if (
    action.includes("RESERVATION") ||
    action.includes("BED") ||
    entity.includes("reservation")
  ) {
    return "reservation";
  }

  if (
    action.includes("DOCTOR") ||
    entity.includes("doctor")
  ) {
    return "doctor";
  }

  return "system";
}

export function mapActivityLogToItem(log: ActivityLog): ActivityItem {
  return {
    id: log._id,
    action: log.action,
    description: log.description,
    timestamp: formatRelativeTime(log.createdAt),
    type: resolveActivityType(log),
  };
}

export function mapActivityLogs(logs: ActivityLog[]): ActivityItem[] {
  return logs.map(mapActivityLogToItem);
}
