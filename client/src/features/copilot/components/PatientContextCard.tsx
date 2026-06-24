import { motion } from "framer-motion";
import { Activity, Building2, Calendar, Heart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCopilot } from "@/features/copilot/context/CopilotContext";
import { getRiskBadgeClass } from "@/features/copilot/utils/copilotUtils";

export function PatientContextCard() {
  const { patientContext } = useCopilot();

  if (!patientContext) return null;

  const context = patientContext;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-sky-50/50 p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-semibold text-text-primary">
              {context.patientName}
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary">{context.diagnosis}</p>
        </div>

        <Badge variant="outline" className={getRiskBadgeClass(context.riskLevel)}>
          {context.riskLevel} RISK
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {context.age !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3.5 w-3.5 text-text-secondary" />
            <span>Age {context.age}</span>
          </div>
        )}
        {context.gender && (
          <div className="flex items-center gap-2 text-sm">
            <Heart className="h-3.5 w-3.5 text-text-secondary" />
            <span>{context.gender}</span>
          </div>
        )}
        {context.sourceHospital && (
          <div className="col-span-2 flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-text-secondary" />
            <span className="truncate">{context.sourceHospital}</span>
          </div>
        )}
        {context.referralStatus && (
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-3.5 w-3.5 text-text-secondary" />
            <span>{context.referralStatus}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
