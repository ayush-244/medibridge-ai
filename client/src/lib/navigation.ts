import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROLES, type UserRole } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HOSPITAL_ADMIN,
      ROLES.REFERRAL_COORDINATOR,
      ROLES.DOCTOR,
    ],
  },
  {
    title: "Referrals",
    icon: FileText,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HOSPITAL_ADMIN,
      ROLES.REFERRAL_COORDINATOR,
    ],
    children: [
      {
        title: "All Referrals",
        href: ROUTES.REFERRALS,
        icon: FileText,
        roles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOSPITAL_ADMIN,
          ROLES.REFERRAL_COORDINATOR,
        ],
      },
      {
        title: "Inbound",
        href: ROUTES.REFERRALS_INBOUND,
        icon: FileText,
        roles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOSPITAL_ADMIN,
          ROLES.REFERRAL_COORDINATOR,
        ],
      },
      {
        title: "Outbound",
        href: ROUTES.REFERRALS_OUTBOUND,
        icon: FileText,
        roles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOSPITAL_ADMIN,
          ROLES.REFERRAL_COORDINATOR,
        ],
      },
    ],
  },
  {
    title: "Resources",
    icon: Building2,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HOSPITAL_ADMIN,
      ROLES.REFERRAL_COORDINATOR,
      ROLES.DOCTOR,
    ],
    children: [
      {
        title: "Hospitals",
        href: ROUTES.HOSPITALS,
        icon: Building2,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        title: "Doctors",
        href: ROUTES.DOCTORS,
        icon: Stethoscope,
        roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
      },
      {
        title: "Reservations",
        href: ROUTES.RESERVATIONS,
        icon: CalendarClock,
        roles: [
          ROLES.SUPER_ADMIN,
          ROLES.HOSPITAL_ADMIN,
          ROLES.DOCTOR,
        ],
      },
    ],
  },
  {
    title: "Analytics",
    icon: BarChart3,
    roles: [ROLES.SUPER_ADMIN],
    children: [
      {
        title: "Reports",
        href: ROUTES.REPORTS,
        icon: Activity,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        title: "Audit Logs",
        href: ROUTES.AUDIT_LOGS,
        icon: ClipboardList,
        roles: [ROLES.SUPER_ADMIN],
      },
    ],
  },
  {
    title: "Administration",
    icon: Users,
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
    children: [
      {
        title: "Users",
        href: ROUTES.USERS,
        icon: Users,
        roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
      },
    ],
  },
  {
    title: "Notifications",
    href: ROUTES.NOTIFICATIONS,
    icon: Bell,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HOSPITAL_ADMIN,
      ROLES.REFERRAL_COORDINATOR,
      ROLES.DOCTOR,
    ],
  },
  {
    title: "Settings",
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.HOSPITAL_ADMIN,
      ROLES.REFERRAL_COORDINATOR,
      ROLES.DOCTOR,
    ],
  },
];

export function getNavigationForRole(role: UserRole): NavItem[] {
  return navigationConfig
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) =>
        child.roles.includes(role),
      ),
    }))
    .filter((item) => item.href || (item.children && item.children.length > 0));
}

export const routeRoles: Record<string, UserRole[]> = {
  [ROUTES.DASHBOARD]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
    ROLES.DOCTOR,
  ],
  [ROUTES.REFERRALS]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
  ],
  [ROUTES.REFERRALS_INBOUND]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
  ],
  [ROUTES.REFERRALS_OUTBOUND]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
  ],
  [ROUTES.HOSPITALS]: [ROLES.SUPER_ADMIN],
  [ROUTES.DOCTORS]: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
  [ROUTES.RESERVATIONS]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.DOCTOR,
  ],
  [ROUTES.REPORTS]: [ROLES.SUPER_ADMIN],
  [ROUTES.NOTIFICATIONS]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
    ROLES.DOCTOR,
  ],
  [ROUTES.SETTINGS]: [
    ROLES.SUPER_ADMIN,
    ROLES.HOSPITAL_ADMIN,
    ROLES.REFERRAL_COORDINATOR,
    ROLES.DOCTOR,
  ],
  [ROUTES.USERS]: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN],
  [ROUTES.AUDIT_LOGS]: [ROLES.SUPER_ADMIN],
};

export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  referrals: "Referrals",
  inbound: "Inbound",
  outbound: "Outbound",
  hospitals: "Hospitals",
  doctors: "Doctors",
  reservations: "Reservations",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  users: "Users",
  admin: "Admin",
  "audit-logs": "Audit Logs",
};
