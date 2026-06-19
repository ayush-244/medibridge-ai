import { Card, CardContent } from "@/components/ui/card";

export function RecommendationsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
              {Array.from({ length: 4 }).map((_, k) => (
                <div key={k} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
