import { useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  MapPin,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface SmartActionsProps {
  referralId?: string;
  variant?: "snapshot" | "drawer" | "inline";
}

export function SmartActions({
  referralId,
  variant = "inline",
}: SmartActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Referral",
      icon: UserPlus,
      onClick: () => navigate(ROUTES.REFERRALS),
    },
    {
      label: "Open Hospital Matching",
      icon: MapPin,
      disabled: !referralId,
      onClick: () =>
        navigate(
          `${ROUTES.AI_RECOMMENDATIONS}?referral_id=${referralId}`,
        ),
    },
    {
      label: "View Documents",
      icon: Building2,
      onClick: () => {
        window.dispatchEvent(new CustomEvent("copilot-scroll-documents"));
      },
    },
    {
      label: "Generate Full Summary",
      icon: FileText,
      onClick: () => {
        window.dispatchEvent(
          new CustomEvent("copilot-quick-action", {
            detail: { question: "Generate a comprehensive clinical summary for this patient." },
          }),
        );
      },
    },
  ];

  const buttonClass =
    variant === "snapshot"
      ? "h-auto rounded-full bg-white/90 px-3 py-1.5 text-xs shadow-sm hover:bg-primary/10 hover:text-primary"
      : variant === "drawer"
        ? "h-auto w-full justify-start rounded-lg py-2 text-xs"
        : "h-auto rounded-full bg-slate-100/80 px-3 py-1.5 text-xs hover:bg-primary/10 hover:text-primary";

  return (
    <div className={cn("space-y-2", variant === "drawer" && "pt-1")}>
      {variant !== "snapshot" && (
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Quick Actions
        </p>
      )}
      <div
        className={cn(
          "flex gap-2",
          variant === "drawer" ? "flex-col" : "flex-wrap",
        )}
      >
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={variant === "drawer" ? "secondary" : "secondary"}
            size="sm"
            disabled={action.disabled}
            className={buttonClass}
            onClick={action.onClick}
          >
            <action.icon className="mr-1.5 h-3.5 w-3.5" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
