import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";

const statusConfig = {
  connected: {
    label: "Connected",
    dotClass: "bg-success",
    textClass: "text-success",
  },
  reconnecting: {
    label: "Reconnecting",
    dotClass: "bg-warning animate-pulse",
    textClass: "text-warning",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-text-secondary",
    textClass: "text-text-secondary",
  },
} as const;

export function ConnectionStatusIndicator() {
  const { connectionStatus } = useSocket();
  const config = statusConfig[connectionStatus];

  return (
    <div
      className="hidden items-center gap-1.5 sm:flex"
      title={`Realtime: ${config.label}`}
      aria-label={`Connection status: ${config.label}`}
    >
      <span
        className={cn("h-2 w-2 rounded-full", config.dotClass)}
        aria-hidden
      />
      <span className={cn("text-xs font-medium", config.textClass)}>
        {config.label}
      </span>
    </div>
  );
}
