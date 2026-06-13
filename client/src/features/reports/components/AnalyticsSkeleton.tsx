import { Card, CardContent } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-border">
            <CardContent className="space-y-4 p-6">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="space-y-4 p-6">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
              <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
