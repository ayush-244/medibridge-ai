import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  useNotifications as useNotificationsState,
} from "@/features/notifications/hooks/useNotifications";

type NotificationsContextValue = ReturnType<typeof useNotificationsState>;

const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const value = useNotificationsState();

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotificationsContext must be used within a NotificationsProvider",
    );
  }

  return context;
}
