import { Building2, Stethoscope, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceMetric } from "@/components/common/ResourceCard";
import { RecommendationBreakdown } from "@/components/recommendations/RecommendationBreakdown";
import { getSpecialistDisplayName } from "@/features/ai-recommendations/utils/specialistDisplay";
import type { RecommendedHospital } from "@/types/recommendation.types";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  hospital: RecommendedHospital;
  rank: number;
}

function getRankLabel(rank: number): string {
  if (rank === 1) return "Best Match";
  return "Alternative";
}

export function RecommendationCard({ hospital, rank }: RecommendationCardProps) {
  const isBestMatch = rank === 1;

  return (
    <Card
      className={cn(
        "border-border transition-all duration-200",
        isBestMatch && "border-primary/30 shadow-md ring-1 ring-primary/10",
      )}
    >
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isBestMatch
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary",
              )}
            >
              {isBestMatch ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-text-primary">
                  {hospital.hospitalName}
                </h3>
                <Badge variant={isBestMatch ? "default" : "secondary"}>
                  #{rank} {getRankLabel(rank)}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
                <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                {hospital.doctorName}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-text-secondary">Overall Score</p>
            <p
              className={cn(
                "text-2xl font-bold",
                isBestMatch ? "text-primary" : "text-text-primary",
              )}
            >
              {hospital.score}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResourceMetric
            label="Specialist"
            value={getSpecialistDisplayName(hospital.specialist)}
          />
          <ResourceMetric
            label="Available Beds"
            value={hospital.availableBeds}
            highlight
          />
          <ResourceMetric
            label="Distance"
            value={`${hospital.distanceKm.toFixed(2)} km`}
          />
        </div>

        <RecommendationBreakdown breakdown={hospital.breakdown} />
      </CardContent>
    </Card>
  );
}
