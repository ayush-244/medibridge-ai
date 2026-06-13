import { REFERRAL_STATUSES } from "@/lib/constants";

export function ReferralKanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {REFERRAL_STATUSES.map((status) => (
        <div
          key={status}
          className="w-72 shrink-0 rounded-lg border border-border bg-gray-50/50"
        >
          <div className="border-b border-border px-4 py-3">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="space-y-3 p-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-white p-4"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="mt-3 h-3 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
