import { BedDouble, HeartPulse, Stethoscope, FileText } from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { DistributionChart } from "@/features/reports/components/DistributionChart";
import { useHospitalAnalytics } from "@/features/hospitals/hooks/useHospitalAnalytics";
import { Loader2 } from "lucide-react";

interface HospitalAnalyticsTabProps {
  hospitalId: string;
}

export function HospitalAnalyticsTab({ hospitalId }: HospitalAnalyticsTabProps) {
  const { analytics, isLoading, error } = useHospitalAnalytics(hospitalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <EmptyState
        title="Failed to load analytics"
        description={error || "Analytics data is unavailable."}
        icon={<FileText className="h-6 w-6" />}
      />
    );
  }

  const acceptanceRate =
    analytics.totalReferrals > 0
      ? `${Math.round(
          (analytics.acceptedReferrals / analytics.totalReferrals) * 100,
        )}%`
      : "0%";

  const bedOccupied =
    analytics.totalBeds > 0
      ? analytics.totalBeds - analytics.availableBeds
      : 0;

  const doctorChartData = [
    {
      name: "Available",
      value: analytics.availableDoctors,
      fill: "hsl(var(--success))",
    },
    {
      name: "Other",
      value: Math.max(analytics.totalDoctors - analytics.availableDoctors, 0),
      fill: "hsl(var(--primary))",
    },
  ];

  return (
    <div className="space-y-6">
      <MetricsGrid columns={2}>
        <StatCard
          title="Total Referrals"
          value={analytics.totalReferrals}
          icon={FileText}
        />
        <StatCard
          title="Acceptance Rate"
          value={acceptanceRate}
          icon={FileText}
          trend={{
            value: `${analytics.acceptedReferrals} accepted`,
          }}
        />
        <StatCard
          title="Bed Utilization"
          value={analytics.occupancyRate}
          icon={BedDouble}
          trend={{
            value: `${bedOccupied} occupied`,
          }}
        />
        <StatCard
          title="Available Beds"
          value={analytics.availableBeds}
          icon={BedDouble}
          description={`of ${analytics.totalBeds} total`}
        />
        <StatCard
          title="ICU Beds Available"
          value={analytics.availableICUBeds}
          icon={HeartPulse}
          description={`of ${analytics.totalICUBeds} total`}
        />
        <StatCard
          title="Doctors"
          value={analytics.totalDoctors}
          icon={Stethoscope}
          trend={{
            value: `${analytics.availableDoctors} available`,
          }}
        />
      </MetricsGrid>

      <div>
        <h4 className="mb-3 text-sm font-medium text-text-secondary">
          Doctor Distribution
        </h4>
        <DistributionChart data={doctorChartData} type="pie" />
      </div>
    </div>
  );
}
