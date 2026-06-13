export function ReferralDrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          <div className="rounded-lg border border-border p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
