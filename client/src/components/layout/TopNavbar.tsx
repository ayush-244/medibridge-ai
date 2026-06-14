import { Link, useLocation } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { breadcrumbLabels, getDefaultRouteForRole } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ConnectionStatusIndicator } from "@/components/layout/ConnectionStatusIndicator";
import { NotificationBell } from "@/features/notifications";

interface TopNavbarProps {
  collapsed: boolean;
  onMobileMenuOpen: () => void;
}

export function TopNavbar({ onMobileMenuOpen }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const homeRoute = user ? getDefaultRouteForRole(user.role) : ROUTES.DASHBOARD;

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      label: breadcrumbLabels[segment] || segment,
      path,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <header className="sticky top-0 z-30 flex h-navbar items-center gap-4 border-b border-border bg-white px-4 shadow-navbar lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <nav className="hidden min-w-0 items-center gap-1 text-sm md:flex">
        <Link
          to={homeRoute}
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.path} className="flex items-center gap-1">
            <span className="text-text-secondary">/</span>
            {crumb.isLast ? (
              <span className="font-medium text-text-primary">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-text-secondary transition-colors hover:text-text-primary"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ConnectionStatusIndicator />

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search..."
            className="w-48 pl-9 lg:w-64"
            disabled
          />
        </div>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <UserAvatar user={user ?? {}} size="sm" />
              <span className="hidden text-sm font-medium md:inline-block">
                {user?.name || user?.email || "User"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.name || "User"}</span>
                <span className="text-xs font-normal text-text-secondary">
                  {user?.role.replace(/_/g, " ")}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={ROUTES.SETTINGS}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onClick={logout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
