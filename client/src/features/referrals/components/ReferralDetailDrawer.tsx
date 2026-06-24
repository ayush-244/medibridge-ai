import { useState } from "react";
import { Bot, Clock, FileText, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import {
  ReferralPriorityBadge,
  ReferralStatusBadge,
} from "@/components/common/StatusBadge";
import { ReferralDrawerSkeleton } from "@/features/referrals/components/ReferralDrawerSkeleton";
import { ReferralTimelineView } from "@/features/referrals/components/ReferralTimelineView";
import { DocumentsTab } from "@/features/referrals/components/DocumentsTab";
import { ReferralRouteMap } from "@/features/maps/components/ReferralRouteMap";
import { SpecialistRecommendationCard } from "@/features/ai-recommendations";
import { HospitalRecommendationSection } from "@/features/referrals/components/HospitalRecommendationSection";
import {
  canCompleteReferral,
  formatReferralDate,
  getHospitalCity,
  getHospitalLocation,
  getHospitalName,
} from "@/features/referrals/utils/referralUtils";
import { getReferralPriority } from "@/features/referrals/utils/severity";
import type {
  Referral,
  ReferralAction,
} from "@/features/referrals/types/referral.types";
import type { CopilotReferralContext } from "@/features/copilot/types/copilot.types";

interface DetailRowProps {
  label: string;
  value: string | number;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}


interface ReferralDetailDrawerProps {
  referral: Referral | null;
  open: boolean;
  actionLoading: ReferralAction | null;
  onOpenChange: (open: boolean) => void;
  onAction: (action: ReferralAction) => void;
  onOpenCopilot?: (context: CopilotReferralContext) => void;
  userHospitalId?: string | null;
}

export function ReferralDetailDrawer({
  referral,
  open,
  actionLoading,
  onOpenChange,
  onAction,
  onOpenCopilot,
  userHospitalId,
}: ReferralDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "documents">("details");

  if (!referral) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="sm:max-w-lg">
          <ReferralDrawerSkeleton />
        </SheetContent>
      </Sheet>
    );
  }

  const priority = getReferralPriority(referral.condition);
  const requestedBy =
    typeof referral.requestedBy === "string"
      ? referral.requestedBy
      : referral.requestedBy.name;

  const destinationHospitalId =
    typeof referral.toHospital === "string"
      ? referral.toHospital
      : referral.toHospital._id;

  const isDestinationHospital =
    !!userHospitalId && userHospitalId === destinationHospitalId;

  const canRespondToReferral =
    isDestinationHospital && referral.status === "PENDING";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle>{referral.patientName}</SheetTitle>
              <SheetDescription>{referral.condition}</SheetDescription>
            </div>
            <ReferralStatusBadge status={referral.status} />
          </div>
        </SheetHeader>

        <div className="flex gap-1 border-b border-border px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            <FileText className="h-4 w-4" />
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("documents")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "documents"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            <FolderOpen className="h-4 w-4" />
            Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "timeline"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary",
            )}
          >
            <Clock className="h-4 w-4" />
            Timeline
          </button>
        </div>

        <SheetBody className="flex-1">
          {activeTab === "details" ? (
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold">Patient Information</h4>
                <div className="divide-y divide-border rounded-lg border border-border px-4">
                  <DetailRow label="Patient Name" value={referral.patientName} />
                  <DetailRow label="Age" value={referral.age} />
                  <DetailRow label="Condition" value={referral.condition} />
                  <DetailRow label="Priority" value={priority} />
                  <DetailRow label="Requested By" value={requestedBy} />
                  <DetailRow
                    label="Created"
                    value={formatReferralDate(referral.createdAt)}
                  />
                  <DetailRow
                    label="Last Updated"
                    value={formatReferralDate(referral.updatedAt)}
                  />
                </div>
              </div>

              <SpecialistRecommendationCard
                referralId={referral._id}
                enabled={open}
              />

              <HospitalRecommendationSection
                referralId={referral._id}
                enabled={open}
              />

              <div>
                <h4 className="mb-2 text-sm font-semibold">Hospital Routing</h4>
                <div className="divide-y divide-border rounded-lg border border-border px-4">
                  <DetailRow
                    label="From Hospital"
                    value={getHospitalName(referral.fromHospital)}
                  />
                  <DetailRow
                    label="From City"
                    value={getHospitalCity(referral.fromHospital) || "\u2014"}
                  />
                  <DetailRow
                    label="To Hospital"
                    value={getHospitalName(referral.toHospital)}
                  />
                  <DetailRow
                    label="To City"
                    value={getHospitalCity(referral.toHospital) || "\u2014"}
                  />
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Route Overview</h4>
                <ReferralRouteMap
                  sourceName={getHospitalName(referral.fromHospital)}
                  destinationName={getHospitalName(referral.toHospital)}
                  sourceLocation={getHospitalLocation(referral.fromHospital)}
                  destinationLocation={getHospitalLocation(referral.toHospital)}
                  className="h-[280px]"
                />
              </div>

              <ReferralPriorityBadge priority={priority} />
            </div>
          ) : activeTab === "documents" ? (
            <div className="py-4">
              <DocumentsTab referralId={referral._id} open={open} />
            </div>
          ) : (
            <div className="py-4">
              <ReferralTimelineView
                referralId={referral._id}
                open={open}
              />
            </div>
          )}
        </SheetBody>

        <div className="border-t border-border p-6 space-y-2">
          {onOpenCopilot && (
            <Button
              variant="secondary"
              className="w-full gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
              onClick={() =>
                onOpenCopilot({
                  referralId: referral._id,
                  patientName: referral.patientName,
                  age: referral.age,
                  diagnosis: referral.condition,
                  condition: referral.condition,
                  sourceHospital: getHospitalName(referral.fromHospital),
                  destinationHospital: getHospitalName(referral.toHospital),
                  priority: getReferralPriority(referral.condition),
                  status: referral.status,
                  documents: [],
                })
              }
            >
              <Bot className="h-4 w-4" />
              Open AI Copilot
            </Button>
          )}
          {canRespondToReferral && (
            <Button
              className="w-full gap-2"
              onClick={() => onAction("accept")}
              disabled={actionLoading !== null}
            >
              {actionLoading === "accept" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Accept Referral
            </Button>
          )}
          {canRespondToReferral && (
            <Button
              variant="danger"
              className="w-full gap-2"
              onClick={() => onAction("reject")}
              disabled={actionLoading !== null}
            >
              {actionLoading === "reject" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Reject Referral
            </Button>
          )}
          {canCompleteReferral(referral.status) && (
            <Button
              variant="secondary"
              className="w-full gap-2"
              onClick={() => onAction("complete")}
              disabled={actionLoading !== null}
            >
              {actionLoading === "complete" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Complete Referral
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
