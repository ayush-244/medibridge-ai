import { Stethoscope } from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { SectionCard } from "@/components/analytics/SectionCard";
import { DistributionChart } from "@/features/reports/components/DistributionChart";
import { MetricsRow } from "@/features/reports/components/MetricItem";
import { buildDoctorChartData } from "@/features/reports/utils/reportUtils";
import type { DoctorSummary } from "@/features/reports/types/report.types";

interface DoctorAnalyticsSectionProps {
  data: DoctorSummary;
  loading?: boolean;
}

export function DoctorAnalyticsSection({
  data,
  loading = false,
}: DoctorAnalyticsSectionProps) {
  const chartData = buildDoctorChartData(data);

  return (
    <SectionCard
      title="Doctor Analytics"
      description="Physician availability and workload across the network"
    >
      <div className="space-y-6">
        <MetricsGrid columns={4}>
          <StatCard
            title="Total Doctors"
            value={data.totalDoctors}
            icon={Stethoscope}
            loading={loading}
          />
          <StatCard
            title="Available"
            value={data.availableDoctors}
            icon={Stethoscope}
            loading={loading}
          />
          <StatCard
            title="Busy"
            value={data.busyDoctors}
            icon={Stethoscope}
            loading={loading}
          />
          <StatCard
            title="Off Duty"
            value={data.offDutyDoctors}
            icon={Stethoscope}
            loading={loading}
          />
        </MetricsGrid>

        <MetricsRow
          metrics={[
            { label: "Average Patient Load", value: data.averageLoad, highlight: true },
          ]}
        />

        <div>
          <h4 className="mb-3 text-sm font-medium text-text-secondary">
            Doctor Status Distribution
          </h4>
          <DistributionChart data={chartData} type="pie" />
        </div>
      </div>
    </SectionCard>
  );
}
