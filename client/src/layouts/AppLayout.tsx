import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { RealtimeToasts } from "@/components/layout/RealtimeToasts";
import { SocketProvider } from "@/context/SocketContext";
import { NotificationsProvider } from "@/features/notifications";
import { useAuth } from "@/hooks/useAuth";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import {
  SOCKET_EVENTS,
  type DoctorEventPayload,
  type UserEventPayload,
} from "@/types/socket";

interface AppLayoutShellProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileMenuOpen: () => void;
}

function AppLayoutShell({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  onMobileMenuOpen,
}: AppLayoutShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={onToggle}
        mobileOpen={mobileOpen}
        onMobileClose={onMobileClose}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar",
        )}
      >
        <TopNavbar
          collapsed={collapsed}
          onMobileMenuOpen={onMobileMenuOpen}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AuthProfileSync() {
  const { user, refreshProfile } = useAuth();

  useSocketEvent(
    SOCKET_EVENTS.USER_UPDATED,
    (event: UserEventPayload) => {
      if (event.userId === user?.id) {
        void refreshProfile();
      }
    },
    Boolean(user?.id),
  );

  useSocketEvent(
    SOCKET_EVENTS.DOCTOR_UPDATED,
    (event: DoctorEventPayload) => {
      if (event.userId === user?.id) {
        void refreshProfile();
      }
    },
    Boolean(user?.id),
  );

  return null;
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SocketProvider>
      <NotificationsProvider>
        <AuthProfileSync />
        <RealtimeToasts />
        <AppLayoutShell
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
      </NotificationsProvider>
    </SocketProvider>
  );
}
