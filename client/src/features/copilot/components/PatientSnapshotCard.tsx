import { motion } from "framer-motion";
import {
  AlertTriangle,
  Brain,
  Loader2,
  Pill,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PatientSnapshot } from "@/features/copilot/types/copilot.types";
import {
  getRiskBadgeClass,
  getUrgencyBadgeClass,
} from "@/features/copilot/utils/copilotUtils";
import { SmartActions } from "@/features/copilot/components/SmartActions";

interface PatientSnapshotCardProps {
  snapshot: PatientSnapshot | null;
  isLoading?: boolean;
  patientId: string;
  referralId?: string;
}

export function PatientSnapshotCard({
  snapshot,
  isLoading,
  patientId,
  referralId,
}: PatientSnapshotCardProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-[900px] rounded-2xl border border-primary/10 bg-white/70 p-5 shadow-sm backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Generating AI Patient Snapshot...
        </div>
      </motion.div>
    );
  }

  if (!snapshot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-[900px] overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-white/90 via-sky-50/30 to-primary/5 shadow-lg backdrop-blur-md"
    >
      <div className="border-b border-primary/10 bg-gradient-to-r from-primary/5 to-sky-500/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-600">
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">AI Patient Snapshot</h3>
          <Badge variant="outline" className="ml-auto border-primary/20 bg-white/80 text-xs">
            <Sparkles className="mr-1 h-3 w-3 text-primary" />
            {snapshot.confidence}% confidence
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <SnapshotField label="Primary Diagnosis" value={snapshot.primaryDiagnosis} />
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Risk Level
          </span>
          <Badge variant="outline" className={getRiskBadgeClass(snapshot.riskLevel)}>
            {snapshot.riskLevel}
          </Badge>
        </div>

        <div className="sm:col-span-2">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
            <Pill className="h-3.5 w-3.5" />
            Current Medications
          </p>
          {snapshot.medications.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {snapshot.medications.map((med) => (
                <li
                  key={med}
                  className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-text-primary shadow-sm"
                >
                  {med}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">No medications documented</p>
          )}
        </div>

        <SnapshotField
          label="Recommended Specialist"
          value={snapshot.recommendedSpecialist}
          icon={Stethoscope}
        />
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
            Urgency
          </p>
          <Badge variant="outline" className={getUrgencyBadgeClass(snapshot.urgency)}>
            {snapshot.urgency}
          </Badge>
        </div>

        {snapshot.transferRecommendation && (
          <div className="sm:col-span-2">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
              <AlertTriangle className="h-3.5 w-3.5" />
              Transfer Recommendation
            </p>
            <p className="text-sm font-medium text-text-primary">
              {snapshot.transferRecommendation}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-primary/10 bg-white/40 px-5 py-3">
        <SmartActions
          patientId={patientId}
          referralId={referralId}
          variant="snapshot"
        />
      </div>
    </motion.div>
  );
}

function SnapshotField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
