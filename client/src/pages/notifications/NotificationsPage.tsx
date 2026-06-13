import { Bell } from "lucide-react";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export function NotificationsPage() {
  return (
    <PagePlaceholder
      title="Notifications"
      description="Real-time alerts for referrals, bed reservations, and assignments."
      icon={<Bell className="h-6 w-6" />}
    />
  );
}
