import { Activity } from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { SectionCard } from "@/components/analytics/SectionCard";

export function DoctorDashboardSkeleton() {
  return (
    <div className="page-container space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
      </div>

      <MetricsGrid columns={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} title="" value="" icon={Activity} loading />
        ))}
      </MetricsGrid>

      <SectionCard title="Loading..." description="">
        <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Loading..." description="">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Loading..." description="">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
