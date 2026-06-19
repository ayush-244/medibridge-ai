import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/analytics/SectionCard";
import { usePendingDoctors } from "@/features/doctors/hooks/usePendingDoctors";
import { getHospitalName } from "@/features/users/utils/userUtils";

export function PendingDoctorsPage() {
  const {
    doctors,
    isLoading,
    error,
    actionId,
    approveDoctor,
    rejectDoctor,
    refetch,
  } = usePendingDoctors();

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
        title="Pending Doctors"
        description="Review and approve doctor registration requests for your hospital"
      />

      {error ? (
        <EmptyState
          title="Failed to load pending doctors"
          description={error}
          action={<Button onClick={() => void refetch()}>Retry</Button>}
        />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No pending doctors"
          description="All doctor registrations have been reviewed."
        />
      ) : (
        <SectionCard
          title="Awaiting Approval"
          description={`${doctors.length} doctor(s) pending review`}
        >
          <div className="divide-y divide-border rounded-lg border border-border">
            {doctors.map((doctor) => {
              const isBusy = actionId === doctor._id;

              return (
                <div
                  key={doctor._id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-text-primary">{doctor.name}</p>
                    <p className="text-sm text-text-secondary">{doctor.email}</p>
                    <p className="text-sm text-text-secondary">
                      {doctor.doctorProfile?.specialization || "—"} ·{" "}
                      {getHospitalName(doctor.hospital)}
                    </p>
                    <Badge variant="secondary">PENDING</Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => void rejectDoctor(doctor._id, doctor.name)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void approveDoctor(doctor._id, doctor.name)}
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
