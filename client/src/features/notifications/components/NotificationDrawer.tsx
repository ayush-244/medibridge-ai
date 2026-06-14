import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useNotificationsContext } from "@/features/notifications/context/NotificationsContext";
import type { Notification } from "@/features/notifications/types/notification.types";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const typeVariants = {
  INFO: "default" as const,
  SUCCESS: "success" as const,
  WARNING: "warning" as const,
  ERROR: "danger" as const,
};

function formatTimestamp(date: string): string {
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      className={cn(
        "w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-gray-50",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-text-primary">
              {notification.title}
            </p>
            <Badge variant={typeVariants[notification.type]} className="text-[10px]">
              {notification.type}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
    </button>
  );
}

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotificationsContext();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>
            Real-time alerts for referrals, reservations, and assignments.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-sm text-text-secondary">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "All caught up"}
          </p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="mt-3 text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <EmptyState
            title="Failed to load notifications"
            description={error}
            icon={<Bell className="h-6 w-6" />}
            action={
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            }
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up. New alerts will appear here in real time."
            icon={<Bell className="h-6 w-6" />}
          />
        ) : (
          <ScrollArea className="h-[calc(100vh-14rem)] pr-2">
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="mt-auto border-t border-border pt-4">
          <Button variant="secondary" className="w-full" asChild>
            <Link to={ROUTES.NOTIFICATIONS} onClick={() => onOpenChange(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
