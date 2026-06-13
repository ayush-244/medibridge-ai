import { REFERRAL_STATUSES } from "@/lib/constants";
import { ReferralCard } from "@/features/referrals/components/ReferralCard";
import type { Referral } from "@/features/referrals/types/referral.types";

interface ReferralKanbanProps {
  referrals: Referral[];
  onSelect: (referral: Referral) => void;
}

const columnLabels: Record<(typeof REFERRAL_STATUSES)[number], string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
};

export function ReferralKanban({ referrals, onSelect }: ReferralKanbanProps) {
  const grouped = REFERRAL_STATUSES.reduce(
    (acc, status) => {
      acc[status] = referrals.filter((r) => r.status === status);
      return acc;
    },
    {} as Record<(typeof REFERRAL_STATUSES)[number], Referral[]>,
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {REFERRAL_STATUSES.map((status) => (
        <div
          key={status}
          className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-gray-50/50"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">
              {columnLabels[status]}
            </h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-text-secondary">
              {grouped[status].length}
            </span>
          </div>
          <div className="flex-1 space-y-3 p-3">
            {grouped[status].length === 0 ? (
              <p className="py-8 text-center text-xs text-text-secondary">
                No referrals
              </p>
            ) : (
              grouped[status].map((referral) => (
                <ReferralCard
                  key={referral._id}
                  referral={referral}
                  onClick={onSelect}
                  compact
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
