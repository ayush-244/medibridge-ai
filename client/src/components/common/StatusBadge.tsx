import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  DoctorStatus,
  HospitalCapacityStatus,
  ReferralPriority,
  ReferralStatus,
  ReservationStatus,
} from "@/lib/constants";

const doctorStatusConfig: Record<
  DoctorStatus,
  { label: string; variant: "success" | "warning" | "secondary" }
> = {
  AVAILABLE: { label: "Available", variant: "success" },
  BUSY: { label: "Busy", variant: "warning" },
  OFF_DUTY: { label: "Off Duty", variant: "secondary" },
};

const hospitalStatusConfig: Record<
  HospitalCapacityStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  operational: { label: "Operational", variant: "success" },
  limited: { label: "Limited Capacity", variant: "warning" },
  at_capacity: { label: "At Capacity", variant: "danger" },
};

interface DoctorStatusBadgeProps {
  status: DoctorStatus;
  className?: string;
}

interface HospitalStatusBadgeProps {
  status: HospitalCapacityStatus;
  className?: string;
}

export function DoctorStatusBadge({ status, className }: DoctorStatusBadgeProps) {
  const config = doctorStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}

export function HospitalStatusBadge({
  status,
  className,
}: HospitalStatusBadgeProps) {
  const config = hospitalStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}

const referralStatusConfig: Record<
  ReferralStatus,
  { label: string; variant: "warning" | "success" | "danger" | "default" }
> = {
  PENDING: { label: "Pending", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  COMPLETED: { label: "Completed", variant: "default" },
};

const referralPriorityConfig: Record<
  ReferralPriority,
  { label: string; variant: "danger" | "warning" | "secondary" }
> = {
  CRITICAL: { label: "Critical", variant: "danger" },
  HIGH: { label: "High", variant: "warning" },
  NORMAL: { label: "Normal", variant: "secondary" },
};

interface ReferralStatusBadgeProps {
  status: ReferralStatus;
  className?: string;
}

interface ReferralPriorityBadgeProps {
  priority: ReferralPriority;
  className?: string;
}

export function ReferralStatusBadge({
  status,
  className,
}: ReferralStatusBadgeProps) {
  const config = referralStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}

export function ReferralPriorityBadge({
  priority,
  className,
}: ReferralPriorityBadgeProps) {
  const config = referralPriorityConfig[priority];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}

const reservationStatusConfig: Record<
  ReservationStatus,
  { label: string; variant: "success" | "warning" | "danger" | "default" | "secondary" }
> = {
  CONFIRMED: { label: "Confirmed", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  EXPIRED: { label: "Expired", variant: "danger" },
  CANCELLED: { label: "Cancelled", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "default" },
};

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export function ReservationStatusBadge({
  status,
  className,
}: ReservationStatusBadgeProps) {
  const config = reservationStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}
