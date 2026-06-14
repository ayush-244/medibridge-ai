import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserStatus } from "@/lib/constants";

const statusConfig: Record<
  UserStatus,
  { label: string; variant: "success" | "warning" | "danger" }
> = {
  ACTIVE: { label: "Active", variant: "success" },
  PENDING: { label: "Pending", variant: "warning" },
  DEACTIVATED: { label: "Deactivated", variant: "danger" },
};

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("shrink-0", className)}>
      {config.label}
    </Badge>
  );
}
