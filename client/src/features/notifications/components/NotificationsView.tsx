import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useNotificationsContext } from "@/features/notifications/context/NotificationsContext";
import type { Notification } from "@/features/notifications/types/notification.types";
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
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors",
        !notification.isRead && "border-primary/20 bg-primary/5",
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-text-primary">
              {notification.title}
            </h3>
            <Badge variant={typeVariants[notification.type]} className="text-[10px]">
              {notification.type}
            </Badge>
            {!notification.isRead && (
              <Badge variant="default" className="text-[10px]">
                New
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {formatTimestamp(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkRead(notification._id)}
          >
            Mark read
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function NotificationsView() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotificationsContext();

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Notifications"
          description="Real-time alerts for referrals, bed reservations, and assignments."
        />
        <EmptyState
          title="Failed to load notifications"
          description={error}
          icon={<Bell className="h-6 w-6" />}
          action={
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Notifications"
        description="Real-time alerts for referrals, bed reservations, and assignments."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="gap-2"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-3 text-sm">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up. New alerts will appear here in real time."
          icon={<Bell className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
