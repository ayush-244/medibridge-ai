import { BarChart3 } from "lucide-react";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export function ReportsPage() {
  return (
    <PagePlaceholder
      title="Reports"
      description="Analytics and insights across hospitals, doctors, and referrals."
      icon={<BarChart3 className="h-6 w-6" />}
    />
  );
}
