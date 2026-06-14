import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationDrawer } from "@/features/notifications/components/NotificationDrawer";
import { useNotificationsContext } from "@/features/notifications/context/NotificationsContext";

export function NotificationBell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { unreadCount } = useNotificationsContext();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setDrawerOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="danger"
            className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
