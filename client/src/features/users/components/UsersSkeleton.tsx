import { Card, CardContent } from "@/components/ui/card";

export function UsersSkeleton() {
  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-4 flex-1 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-border px-4 py-4 last:border-0"
          >
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className="h-4 flex-1 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
