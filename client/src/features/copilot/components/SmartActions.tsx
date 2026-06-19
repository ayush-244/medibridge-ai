import { useNavigate } from "react-router-dom";
import {
  Building2,
  Download,
  FileText,
  MapPin,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

interface SmartActionsProps {
  patientId: string;
  referralId?: string;
}

export function SmartActions({ patientId, referralId }: SmartActionsProps) {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Create Referral",
      icon: UserPlus,
      onClick: () => navigate(ROUTES.REFERRALS),
    },
    {
      label: "Recommend Specialist",
      icon: Stethoscope,
      onClick: () =>
        navigate(`${ROUTES.COPILOT}?patient_id=${patientId}${referralId ? `&referral_id=${referralId}` : ""}`),
    },
    {
      label: "Open Hospital Matching",
      icon: MapPin,
      disabled: !referralId,
      onClick: () =>
        navigate(
          `${ROUTES.AI_RECOMMENDATIONS}?patient_id=${patientId}&referral_id=${referralId}`,
        ),
    },
    {
      label: "Generate Summary",
      icon: FileText,
      onClick: () => {
        const event = new CustomEvent("copilot-quick-action", {
          detail: { question: "Summarize this patient's medical records." },
        });
        window.dispatchEvent(event);
      },
    },
    {
      label: "View Documents",
      icon: Building2,
      onClick: () => {
        const event = new CustomEvent("copilot-scroll-documents");
        window.dispatchEvent(event);
      },
    },
    {
      label: "Download Report",
      icon: Download,
      onClick: () => {
        const event = new CustomEvent("copilot-quick-action", {
          detail: { question: "Generate a comprehensive clinical report for this patient." },
        });
        window.dispatchEvent(event);
      },
    },
  ];

  return (
    <div className="space-y-2 pt-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Suggested Actions
      </p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="secondary"
            size="sm"
            disabled={action.disabled}
            className="h-auto rounded-full bg-slate-100 px-3 py-1.5 text-xs hover:bg-primary/10 hover:text-primary"
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
