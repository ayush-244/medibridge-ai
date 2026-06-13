import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReferralViewMode } from "@/features/referrals/types/referral.types";

interface ReferralViewSwitcherProps {
  viewMode: ReferralViewMode;
  onChange: (mode: ReferralViewMode) => void;
}

export function ReferralViewSwitcher({
  viewMode,
  onChange,
}: ReferralViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2",
          viewMode === "table" && "bg-sidebar-accent text-primary",
        )}
        onClick={() => onChange("table")}
      >
        <Table2 className="h-4 w-4" />
        Table
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2",
          viewMode === "kanban" && "bg-sidebar-accent text-primary",
        )}
        onClick={() => onChange("kanban")}
      >
        <LayoutGrid className="h-4 w-4" />
        Kanban
      </Button>
    </div>
  );
}
