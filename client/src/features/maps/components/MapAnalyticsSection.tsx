import { Building2, Globe2, Layers } from "lucide-react";
import { MetricsGrid, SectionCard, StatCard } from "@/components/analytics";
import { DistributionChart } from "@/features/reports/components/DistributionChart";
import type { MapAnalyticsData } from "@/features/maps/types/maps.types";

interface MapAnalyticsSectionProps {
  analytics: MapAnalyticsData;
  totalHospitals: number;
  mappedHospitals: number;
  isLoading?: boolean;
}

export function MapAnalyticsSection({
  analytics,
  totalHospitals,
  mappedHospitals,
  isLoading = false,
}: MapAnalyticsSectionProps) {
  return (
    <div className="space-y-6">
      <MetricsGrid columns={3}>
        <StatCard
          title="Hospitals Mapped"
          value={mappedHospitals}
          icon={Building2}
          description={`${totalHospitals} total facilities`}
          loading={isLoading}
        />
        <StatCard
          title="Regions Covered"
          value={analytics.hospitalsByRegion.length}
          icon={Globe2}
          description="States with hospital presence"
          loading={isLoading}
        />
        <StatCard
          title="Capacity Tiers"
          value={analytics.bedCapacityDistribution.length}
          icon={Layers}
          description="Bed capacity distribution"
          loading={isLoading}
        />
      </MetricsGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Hospitals by Region">
          <DistributionChart
            data={analytics.hospitalsByRegion}
            type="bar"
          />
        </SectionCard>
        <SectionCard title="Geographic Distribution">
          <DistributionChart
            data={analytics.geographicDistribution}
            type="pie"
          />
        </SectionCard>
        <SectionCard title="Bed Capacity Distribution">
          <DistributionChart
            data={analytics.bedCapacityDistribution}
            type="bar"
          />
        </SectionCard>
      </div>
    </div>
  );
}
