import { Card, CardContent } from "@/components/ui/card";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="page-container space-y-8">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-8 w-16" />
                </div>
                <SkeletonBlock className="h-10 w-10 rounded-lg" />
              </div>
              <SkeletonBlock className="mt-3 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="space-y-4 p-6">
              <SkeletonBlock className="h-5 w-40" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <SkeletonBlock className="h-4 w-32" />
                    <SkeletonBlock className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-6">
          <SkeletonBlock className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <SkeletonBlock className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
