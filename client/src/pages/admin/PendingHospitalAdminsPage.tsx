import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/analytics/SectionCard";
import { usePendingHospitalAdmins } from "@/features/admin/hooks/usePendingHospitalAdmins";
import { getHospitalName } from "@/features/users/utils/userUtils";

export function PendingHospitalAdminsPage() {
  const {
    users,
    isLoading,
    error,
    actionId,
    approveAdmin,
    rejectAdmin,
    refetch,
  } = usePendingHospitalAdmins();

  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Pending Hospital Admins"
        description="Review and approve hospital administrator accounts"
      />

      {error ? (
        <EmptyState
          title="Failed to load pending hospital admins"
          description={error}
          action={<Button onClick={() => void refetch()}>Retry</Button>}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No pending hospital admins"
          description="All hospital admin registrations have been reviewed."
        />
      ) : (
        <SectionCard
          title="Awaiting Approval"
          description={`${users.length} admin account(s) pending review`}
        >
          <div className="divide-y divide-border rounded-lg border border-border">
            {users.map((user) => {
              const isBusy = actionId === user._id;

              return (
                <div
                  key={user._id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">{user.name}</p>
                    <p className="text-sm text-text-secondary">{user.email}</p>
                    <p className="text-sm text-text-secondary">
                      Hospital: {getHospitalName(user.hospital)}
                    </p>
                    <Badge variant="secondary">PENDING</Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => void rejectAdmin(user._id, user.name)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void approveAdmin(user._id, user.name)}
                    >
                      {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                      Approve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
