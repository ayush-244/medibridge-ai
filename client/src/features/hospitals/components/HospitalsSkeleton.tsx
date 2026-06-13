import { Card, CardContent } from "@/components/ui/card";

export function HospitalsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-border">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
            <div className="h-10 w-full animate-pulse rounded-md bg-gray-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
