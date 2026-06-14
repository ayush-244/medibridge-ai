import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationService } from "@/features/notifications/services/notification.service";
import type {
  Notification,
  NotificationCreatedPayload,
} from "@/features/notifications/types/notification.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

interface FetchOptions {
  silent?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: (options?: FetchOptions) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (options?: FetchOptions) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load notifications";
      if (!options?.silent) {
        setError(message);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const debouncedRefetch = useDebouncedCallback(
    () => fetchNotifications({ silent: true }),
    500,
  );

  const handleNotificationCreated = useCallback(
    (payload: NotificationCreatedPayload) => {
      const optimistic: Notification = {
        _id: `socket-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => {
        const exists = prev.some(
          (n) =>
            n.title === payload.title &&
            n.message === payload.message &&
            !n.isRead,
        );
        if (exists) return prev;
        return [optimistic, ...prev];
      });

      debouncedRefetch();
    },
    [debouncedRefetch],
  );

  useSocketEvent(
    SOCKET_EVENTS.NOTIFICATION_CREATED,
    handleNotificationCreated,
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const markAsRead = useCallback(async (id: string) => {
    if (id.startsWith("socket-")) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );

    try {
      await notificationService.markAsRead(id);
    } catch {
      await fetchNotifications({ silent: true });
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    await Promise.allSettled(
      unread
        .filter((n) => !n._id.startsWith("socket-"))
        .map((n) => notificationService.markAsRead(n._id)),
    );
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}
