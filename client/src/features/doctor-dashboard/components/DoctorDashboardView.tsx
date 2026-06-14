import {
  Activity,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Users,
} from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { SectionCard } from "@/components/analytics/SectionCard";
import { StatCard } from "@/components/analytics/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import { DoctorStatusBadge, ReferralStatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { useDoctorDashboard } from "@/features/doctor-dashboard/hooks/useDoctorDashboard";
import { DoctorDashboardSkeleton } from "@/features/doctor-dashboard/components/DoctorDashboardSkeleton";
import { formatReferralDate } from "@/features/referrals/utils/referralUtils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function DoctorDashboardView() {
  const { data, isLoading, error, refetch } = useDoctorDashboard();

  if (isLoading) {
    return <DoctorDashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="page-container">
        <EmptyState
          title="Failed to load dashboard"
          description={error || "Unable to load your dashboard data."}
          icon={<Activity className="h-6 w-6" />}
          action={
            <Button onClick={() => void refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const { doctor, hospital, stats, assignedReferrals, activeCases, completedCases } =
    data;

  return (
    <div className="page-container space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <DoctorAvatar
            doctor={{ name: doctor.name, profilePhoto: doctor.profilePhoto }}
            size="lg"
          />
          <div>
            <h1>Doctor Dashboard</h1>
            <p className="mt-1 text-text-secondary">
              {doctor.name} · {doctor.specialization}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DoctorStatusBadge status={doctor.status as "AVAILABLE" | "BUSY" | "OFF_DUTY"} />
          <Badge variant="secondary">Doctor</Badge>
        </div>
      </div>

      <MetricsGrid columns={4}>
        <StatCard
          title="Active Reservations"
          value={stats.activeReservations}
          icon={CalendarClock}
          description="Confirmed bed holds"
        />
        <StatCard
          title="Capacity Used"
          value={stats.capacityUsed}
          icon={Users}
          description={`${doctor.currentPatients}/${doctor.maxPatients} patients`}
        />
        <StatCard
          title="Active Cases"
          value={stats.activeCaseCount}
          icon={Activity}
          description="In-progress assignments"
        />
        <StatCard
          title="Completed Cases"
          value={stats.completedCaseCount}
          icon={CheckCircle2}
          description="Finished this period"
        />
      </MetricsGrid>

      <SectionCard
        title="Hospital Assignment"
        description="Your affiliated facility"
      >
        <div className="flex items-center gap-3">
          <HospitalAvatar hospital={hospital} size="md" />
          <div>
            <p className="font-medium text-text-primary">{hospital.name}</p>
            <p className="text-sm text-text-secondary">{hospital.city}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Assigned Referrals"
        description={`${assignedReferrals.length} referrals linked to your assignments`}
      >
        {assignedReferrals.length === 0 ? (
          <EmptyState
            title="No assigned referrals"
            description="Referrals will appear here when patients are assigned to you."
            icon={<ClipboardList className="h-6 w-6" />}
          />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {assignedReferrals.map((referral) => (
              <div
                key={referral._id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-text-primary">
                    {referral.patientName}
                  </p>
                  <p className="truncate text-sm text-text-secondary">
                    {referral.condition}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ReferralStatusBadge status={referral.status} />
                  <span className="text-xs text-text-secondary">
                    {formatReferralDate(referral.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Active Cases" description="Current patient assignments">
          {activeCases.length === 0 ? (
            <EmptyState
              title="No active cases"
              description="Active reservations will appear here."
              icon={<Activity className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-3">
              {activeCases.map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{caseItem.patientName}</p>
                    <Badge variant="secondary">{caseItem.reservationStatus}</Badge>
                  </div>
                  {caseItem.referral && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {caseItem.referral.condition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Completed Cases" description="Recently completed work">
          {completedCases.length === 0 ? (
            <EmptyState
              title="No completed cases"
              description="Completed cases will appear here."
              icon={<CheckCircle2 className="h-6 w-6" />}
            />
          ) : (
            <div className="space-y-3">
              {completedCases.map((caseItem) => (
                <div
                  key={caseItem._id}
                  className="rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{caseItem.patientName}</p>
                    <Badge variant="success">Completed</Badge>
                  </div>
                  {caseItem.referral && (
                    <p className="mt-1 text-sm text-text-secondary">
                      {caseItem.referral.condition}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
