import { BarChart3, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useReports } from "@/features/reports/hooks/useReports";
import { AnalyticsSkeleton } from "@/features/reports/components/AnalyticsSkeleton";
import { ExecutiveSummarySection } from "@/features/reports/components/ExecutiveSummarySection";
import { HospitalAnalyticsSection } from "@/features/reports/components/HospitalAnalyticsSection";
import { DoctorAnalyticsSection } from "@/features/reports/components/DoctorAnalyticsSection";
import { ReferralAnalyticsSection } from "@/features/reports/components/ReferralAnalyticsSection";
import { TopHospitalsTable } from "@/features/reports/components/TopHospitalsTable";

export function ReportsView() {
  const { data, isLoading, error, refetch } = useReports();

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Reports & Analytics"
          description="Executive insights across hospitals, doctors, and referrals"
        />
        <EmptyState
          title="Failed to load reports"
          description={error}
          icon={<BarChart3 className="h-6 w-6" />}
          action={
            <Button onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-8">
      <PageHeader
        title="Reports & Analytics"
        description="Executive insights across hospitals, doctors, and referrals"
        action={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <ExecutiveSummarySection data={data.system} />
          <HospitalAnalyticsSection data={data.hospital} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <DoctorAnalyticsSection data={data.doctor} />
            <ReferralAnalyticsSection data={data.referral} />
          </div>
          <TopHospitalsTable hospitals={data.topHospitals} />
        </>
      )}
    </div>
  );
}
