import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/analytics/SectionCard";
import { usePendingHospitals } from "@/features/admin/hooks/usePendingHospitals";

export function PendingHospitalsPage() {
  const {
    hospitals,
    isLoading,
    error,
    actionId,
    approveHospital,
    rejectHospital,
    refetch,
  } = usePendingHospitals();

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
        title="Pending Hospitals"
        description="Review and approve hospital registration requests"
      />

      {error ? (
        <EmptyState
          title="Failed to load pending hospitals"
          description={error}
          action={<Button onClick={() => void refetch()}>Retry</Button>}
        />
      ) : hospitals.length === 0 ? (
        <EmptyState
          title="No pending hospitals"
          description="All hospital registrations have been reviewed."
        />
      ) : (
        <SectionCard
          title="Awaiting Approval"
          description={`${hospitals.length} hospital(s) pending review`}
        >
          <div className="divide-y divide-border rounded-lg border border-border">
            {hospitals.map((hospital) => {
              const adminId = hospital.admin?._id;
              const isBusy = actionId === adminId;

              return (
                <div
                  key={hospital._id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">
                      {hospital.name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {hospital.address}, {hospital.city}, {hospital.state}
                    </p>
                    {hospital.location && (
                      <p className="text-xs text-text-secondary">
                        {hospital.location.latitude.toFixed(6)},{" "}
                        {hospital.location.longitude.toFixed(6)}
                      </p>
                    )}
                    {hospital.admin && (
                      <p className="text-sm text-text-secondary">
                        Admin: {hospital.admin.name} ({hospital.admin.email})
                      </p>
                    )}
                    <Badge variant="secondary">PENDING</Badge>
                  </div>
                  {adminId && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isBusy}
                        onClick={() => void rejectHospital(adminId, hospital.name)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => void approveHospital(adminId, hospital.name)}
                      >
                        {isBusy && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
