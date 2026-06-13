import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { DashboardSection } from "@/features/dashboard/components/DashboardSection";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { DashboardError } from "@/features/dashboard/components/DashboardError";
import { DashboardEmpty } from "@/features/dashboard/components/DashboardEmpty";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import {
  buildKpiCards,
  buildOperationalMetrics,
  buildSystemOverview,
} from "@/features/dashboard/utils/dashboardMappers";
import { MetricRows } from "@/features/dashboard/components/MetricRows";
import { supportsDashboardApi } from "@/features/dashboard/types/dashboard.types";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";

export function DashboardView() {
  const { user } = useAuth();
  const canFetch = user ? supportsDashboardApi(user.role) : false;
  const { stats, isLoading, error, isEmpty, refetch } = useDashboard(canFetch);

  if (!user) return null;

  if (!canFetch) {
    return (
      <div className="page-container">
        <DashboardError
          message="Your role does not have access to the operations dashboard. Contact your administrator."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError message={error} onRetry={refetch} />;
  }

  if (isEmpty || !stats) {
    return <DashboardEmpty />;
  }

  const kpiCards = buildKpiCards(stats);
  const operationalMetrics = buildOperationalMetrics(stats);
  const systemOverview = buildSystemOverview(stats);

  const roleLabel = user.role.replace(/_/g, " ");

  return (
    <div className="page-container space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="mt-1 text-text-secondary">
            Healthcare Operations Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          {stats.hospital && (
            <Badge variant="outline">{stats.hospital}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            description={card.description}
            trend={card.trend}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Operational Metrics"
          description={
            stats.role === ROLES.SUPER_ADMIN
              ? "Network-wide operational indicators"
              : "Hospital-level operational indicators"
          }
        >
          <div>
            <MetricRows metrics={operationalMetrics} />
          </div>
        </DashboardSection>

        <DashboardSection
          title="System Overview"
          description={
            stats.role === ROLES.SUPER_ADMIN
              ? "Capacity and utilization summary"
              : "Your hospital at a glance"
          }
        >
          <div>
            <MetricRows metrics={systemOverview} />
          </div>
        </DashboardSection>
      </div>

      <ActivityFeed />
    </div>
  );
}
