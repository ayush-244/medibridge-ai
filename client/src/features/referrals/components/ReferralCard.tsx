import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ReferralPriorityBadge,
  ReferralStatusBadge,
} from "@/components/common/StatusBadge";
import { getReferralPriority } from "@/features/referrals/utils/severity";
import {
  formatRelativeTime,
  getHospitalName,
} from "@/features/referrals/utils/referralUtils";
import type { Referral } from "@/features/referrals/types/referral.types";

interface ReferralCardProps {
  referral: Referral;
  onClick: (referral: Referral) => void;
  compact?: boolean;
}

export function ReferralCard({
  referral,
  onClick,
  compact = false,
}: ReferralCardProps) {
  const priority = getReferralPriority(referral.condition);
  const toHospital = getHospitalName(referral.toHospital);

  return (
    <button
      type="button"
      onClick={() => onClick(referral)}
      className={cn(
        "w-full rounded-lg border border-border bg-white p-4 text-left transition-all",
        "hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">
            {referral.patientName}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {referral.condition}
          </p>
        </div>
        <ReferralStatusBadge status={referral.status} />
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-text-secondary">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{toHospital}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">
          {formatRelativeTime(referral.createdAt)}
        </span>
        <ReferralPriorityBadge priority={priority} />
      </div>

      {!compact && (
        <p className="mt-2 text-xs text-text-secondary">
          Age {referral.age}
        </p>
      )}
    </button>
  );
}
