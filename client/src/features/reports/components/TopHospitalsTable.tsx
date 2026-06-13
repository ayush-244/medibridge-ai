import { Trophy } from "lucide-react";
import { SectionCard } from "@/components/analytics/SectionCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TopHospitalRanking } from "@/features/reports/types/report.types";

interface TopHospitalsTableProps {
  hospitals: TopHospitalRanking[];
}

export function TopHospitalsTable({ hospitals }: TopHospitalsTableProps) {
  return (
    <SectionCard
      title="Top Hospital Rankings"
      description="Hospitals ranked by accepted inbound referrals"
    >
      {hospitals.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">
          No hospital ranking data available
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {["Rank", "Hospital", "City", "Accepted Referrals", "Available Beds", "Available Doctors"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital, index) => {
                const rank = index + 1;
                const isTop = rank <= 3;

                return (
                  <tr
                    key={`${hospital.hospitalName}-${hospital.city}`}
                    className={cn(
                      "border-b border-border transition-colors last:border-0 hover:bg-gray-50/50",
                      isTop && "bg-primary/5",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isTop && (
                          <Trophy className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-semibold text-text-primary">
                          #{rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-text-primary">
                        {hospital.hospitalName}
                      </span>
                      {rank === 1 && (
                        <Badge variant="default" className="ml-2 text-[10px]">
                          Top Performer
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {hospital.city}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary">
                        {hospital.acceptedReferrals}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {hospital.availableBeds}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {hospital.availableDoctors}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
