import { BedDouble, HeartPulse } from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { SectionCard } from "@/components/analytics/SectionCard";
import { DistributionChart } from "@/features/reports/components/DistributionChart";
import { MetricsRow } from "@/features/reports/components/MetricItem";
import {
  buildBedChartData,
  computeBedOccupancyRate,
  computeIcuOccupancyRate,
} from "@/features/reports/utils/reportUtils";
import type { HospitalSummary } from "@/features/reports/types/report.types";

interface HospitalAnalyticsSectionProps {
  data: HospitalSummary;
  loading?: boolean;
}

export function HospitalAnalyticsSection({
  data,
  loading = false,
}: HospitalAnalyticsSectionProps) {
  const bedChartData = buildBedChartData(data);
  const occupancy = computeBedOccupancyRate(data);
  const icuOccupancy = computeIcuOccupancyRate(data);

  return (
    <SectionCard
      title="Hospital Analytics"
      description="Network bed capacity and utilization"
    >
      <div className="space-y-6">
        <MetricsGrid columns={4}>
          <StatCard
            title="Total Beds"
            value={data.totalBeds}
            icon={BedDouble}
            loading={loading}
          />
          <StatCard
            title="Available Beds"
            value={data.availableBeds}
            icon={BedDouble}
            trend={{ value: `${occupancy} occupied` }}
            loading={loading}
          />
          <StatCard
            title="ICU Beds"
            value={data.totalICUBeds}
            icon={HeartPulse}
            loading={loading}
          />
          <StatCard
            title="Available ICU"
            value={data.availableICUBeds}
            icon={HeartPulse}
            trend={{ value: `${icuOccupancy} occupied` }}
            loading={loading}
          />
        </MetricsGrid>

        <MetricsRow
          columns={3}
          metrics={[
            { label: "Network Hospitals", value: data.totalHospitals },
            { label: "General Occupancy", value: occupancy, highlight: true },
            { label: "ICU Occupancy", value: icuOccupancy, highlight: true },
          ]}
        />

        <div>
          <h4 className="mb-3 text-sm font-medium text-text-secondary">
            Bed Availability
          </h4>
          <DistributionChart data={bedChartData} type="bar" />
        </div>
      </div>
    </SectionCard>
  );
}
