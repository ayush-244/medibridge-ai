import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDefaultRouteForRole,
  getNavigationForRole,
} from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/common/UserAvatar";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Referrals",
    "Resources",
    "Analytics",
  ]);

  if (!user) return null;

  const navItems = getNavigationForRole(user.role);
  const homeRoute = getDefaultRouteForRole(user.role);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const isActive = (href?: string) =>
    href ? location.pathname === href : false;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-navbar items-center border-b border-sidebar-border px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <Link to={homeRoute} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold">MediBridge</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.children?.length) {
              const isExpanded = expandedSections.includes(item.title);

              return (
                <div key={item.title}>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.title)}
                    className={cn(
                      "nav-item w-full",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </>
                    )}
                  </button>

                  {!collapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href!}
                          onClick={onMobileClose}
                          className={cn(
                            "nav-item",
                            isActive(child.href) && "nav-item-active",
                          )}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span>{child.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                to={item.href!}
                onClick={onMobileClose}
                className={cn(
                  "nav-item",
                  collapsed && "justify-center px-2",
                  isActive(item.href) && "nav-item-active",
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2",
            collapsed && "justify-center",
          )}
        >
          <UserAvatar user={user} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user.name || user.email || "User"}
              </p>
              <p className="truncate text-xs text-text-secondary">
                {user.role.replace(/_/g, " ")}
              </p>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-text-secondary hover:text-danger",
            collapsed && "justify-center px-2",
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:translate-x-0",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
