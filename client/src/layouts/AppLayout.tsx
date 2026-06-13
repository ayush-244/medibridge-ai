import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

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
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar",
        )}
      >
        <TopNavbar
          collapsed={collapsed}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
