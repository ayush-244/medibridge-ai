import { Loader2, UserCheck } from "lucide-react";
import { SectionCard } from "@/components/analytics/SectionCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePendingUsers } from "@/features/admin/hooks/usePendingUsers";
import { formatRoleLabel } from "@/features/users/utils/userUtils";

export function PendingUsersPanel() {
  const { users, isLoading, error, approvingId, approveUser, refetch } =
    usePendingUsers();

  if (isLoading) {
    return (
      <SectionCard
        title="Pending User Approvals"
        description="Users awaiting super admin approval"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard
        title="Pending User Approvals"
        description="Users awaiting super admin approval"
      >
        <EmptyState
          title="Failed to load pending users"
          description={error}
          action={<Button onClick={() => void refetch()}>Retry</Button>}
        />
      </SectionCard>
    );
  }

  if (users.length === 0) {
    return (
      <SectionCard
        title="Pending User Approvals"
        description="Users awaiting super admin approval"
      >
        <EmptyState
          title="No pending approvals"
          description="All user registrations have been reviewed."
          icon={<UserCheck className="h-6 w-6" />}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Pending User Approvals"
      description={`${users.length} user(s) awaiting approval`}
    >
      <div className="divide-y divide-border rounded-lg border border-border">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-text-primary">{user.name}</p>
              <p className="text-sm text-text-secondary">{user.email}</p>
              <Badge variant="secondary" className="mt-1">
                {formatRoleLabel(user.role)}
              </Badge>
            </div>
            <Button
              size="sm"
              className="gap-2 shrink-0"
              disabled={approvingId === user._id}
              onClick={() => void approveUser(user._id, user.name)}
            >
              {approvingId === user._id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Approve
            </Button>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
