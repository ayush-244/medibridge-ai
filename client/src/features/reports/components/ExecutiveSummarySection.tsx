import {
  Building2,
  Stethoscope,
  FileText,
  BedDouble,
  Users,
} from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { SectionCard } from "@/components/analytics/SectionCard";
import type { SystemSummary } from "@/features/reports/types/report.types";

interface ExecutiveSummarySectionProps {
  data: SystemSummary;
  loading?: boolean;
}

export function ExecutiveSummarySection({
  data,
  loading = false,
}: ExecutiveSummarySectionProps) {
  return (
    <SectionCard
      title="Executive Summary"
      description="System-wide operational overview"
    >
      <MetricsGrid columns={6}>
        <StatCard
          title="Total Hospitals"
          value={data.totalHospitals}
          icon={Building2}
          loading={loading}
        />
        <StatCard
          title="Total Doctors"
          value={data.totalDoctors}
          icon={Stethoscope}
          loading={loading}
        />
        <StatCard
          title="Available Doctors"
          value={data.availableDoctors}
          icon={Stethoscope}
          description={`${data.busyDoctors} busy`}
          loading={loading}
        />
        <StatCard
          title="Total Referrals"
          value={data.totalReferrals}
          icon={FileText}
          loading={loading}
        />
        <StatCard
          title="Active Reservations"
          value={data.activeReservations}
          icon={BedDouble}
          loading={loading}
        />
        <StatCard
          title="Pending Users"
          value={data.pendingUsers}
          icon={Users}
          loading={loading}
        />
      </MetricsGrid>
    </SectionCard>
  );
}
