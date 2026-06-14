import { AlertTriangle, Loader2, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapStateProps {
  className?: string;
  title: string;
  description?: string;
}

function MapStateContainer({
  className,
  title,
  description,
  icon,
}: MapStateProps & { icon: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center",
        className,
      )}
    >
      <div className="mb-3 text-text-secondary">{icon}</div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}

export function MapLoadingState({ className }: { className?: string }) {
  return (
    <MapStateContainer
      className={className}
      title="Loading map..."
      icon={<Loader2 className="h-8 w-8 animate-spin" />}
    />
  );
}

export function MapErrorState({
  className,
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <MapStateContainer
      className={className}
      title="Unable to load map"
      description={
        message ||
        "The map could not be loaded. Check your network connection and try again."
      }
      icon={<AlertTriangle className="h-8 w-8 text-warning" />}
    />
  );
}

export function MapMissingCoordinatesState({
  className,
  title = "Location not available",
  description = "This hospital does not have coordinates configured yet.",
}: {
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <MapStateContainer
      className={className}
      title={title}
      description={description}
      icon={<MapPinOff className="h-8 w-8" />}
    />
  );
}

export function MapApiKeyMissingState({ className }: { className?: string }) {
  return (
    <MapStateContainer
      className={className}
      title="Road routing unavailable"
      description="Set VITE_OPENROUTESERVICE_API_KEY for driving distance and ETA. Maps still work with estimated straight-line distances."
      icon={<MapPinOff className="h-8 w-8" />}
    />
  );
}
