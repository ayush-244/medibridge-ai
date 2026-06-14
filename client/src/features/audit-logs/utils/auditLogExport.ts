import { exportToCsv } from "@/lib/csvExport";
import type { ActivityLog } from "@/features/dashboard/types/activity.types";
import { formatActivityDate } from "@/features/audit-logs/utils/auditLogUtils";

export function exportAuditLogsToCsv(activities: ActivityLog[]) {
  exportToCsv(
    `audit-logs-${new Date().toISOString().slice(0, 10)}`,
    ["Action", "Module", "Description", "Performed By", "Date"],
    activities.map((activity) => [
      activity.action,
      activity.entityType,
      activity.description,
      activity.performedBy,
      formatActivityDate(activity.createdAt),
    ]),
  );
}
