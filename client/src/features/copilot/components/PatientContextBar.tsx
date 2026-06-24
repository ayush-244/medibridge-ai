import { motion } from "framer-motion";
import { useCopilot } from "@/features/copilot/context/CopilotContext";
import { getRiskBadgeClass } from "@/features/copilot/utils/copilotUtils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PatientContextBar() {
  const { patientContext } = useCopilot();

  if (!patientContext) return null;

  const items = [
    patientContext.patientName && { label: patientContext.patientName, highlight: true },
    patientContext.gender && { label: patientContext.gender },
    patientContext.age !== undefined && { label: `${patientContext.age} Years` },
    patientContext.sourceHospital && { label: `From: ${patientContext.sourceHospital}` },
    patientContext.destinationHospital && { label: `To: ${patientContext.destinationHospital}` },
    { label: `Diagnosis: ${patientContext.diagnosis}` },
  ].filter(Boolean) as { label: string; highlight?: boolean }[];

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[max(56px,min(80px,auto))] shrink-0 items-center gap-3 overflow-x-auto border-b border-white/40 bg-white/50 px-4 py-2 backdrop-blur-md"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-2">
            {index > 0 && (
              <span className="text-border select-none text-slate-300">·</span>
            )}
            <span
              className={cn(
                "whitespace-nowrap text-xs sm:text-sm",
                item.highlight
                  ? "font-semibold text-text-primary"
                  : "text-text-secondary",
              )}
            >
              {item.label}
            </span>
          </span>
        ))}
      </div>

      <Badge
        variant="outline"
        className={cn("shrink-0 text-[10px] sm:text-xs", getRiskBadgeClass(patientContext.riskLevel))}
      >
        Risk: {patientContext.riskLevel}
      </Badge>
    </motion.div>
  );
}
