import { FileText } from "lucide-react";
import { MetricsGrid } from "@/components/analytics/MetricsGrid";
import { StatCard } from "@/components/analytics/StatCard";
import { SectionCard } from "@/components/analytics/SectionCard";
import { DistributionChart } from "@/features/reports/components/DistributionChart";
import { MetricsRow } from "@/features/reports/components/MetricItem";
import { buildReferralChartData } from "@/features/reports/utils/reportUtils";
import type { ReferralSummary } from "@/features/reports/types/report.types";

interface ReferralAnalyticsSectionProps {
  data: ReferralSummary;
  loading?: boolean;
}

export function ReferralAnalyticsSection({
  data,
  loading = false,
}: ReferralAnalyticsSectionProps) {
  const chartData = buildReferralChartData(data);

  return (
    <SectionCard
      title="Referral Analytics"
      description="Referral pipeline performance and acceptance metrics"
    >
      <div className="space-y-6">
        <MetricsGrid columns={4}>
          <StatCard
            title="Total Referrals"
            value={data.totalReferrals}
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Accepted"
            value={data.accepted}
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Pending"
            value={data.pending}
            icon={FileText}
            loading={loading}
          />
          <StatCard
            title="Rejected"
            value={data.rejected}
            icon={FileText}
            loading={loading}
          />
        </MetricsGrid>

        <MetricsRow
          columns={2}
          metrics={[
            { label: "Completed", value: data.completed },
            { label: "Acceptance Rate", value: data.acceptanceRate, highlight: true },
          ]}
        />

        <div>
          <h4 className="mb-3 text-sm font-medium text-text-secondary">
            Referral Status Distribution
          </h4>
          <DistributionChart data={chartData} type="pie" />
        </div>
      </div>
    </SectionCard>
  );
}
