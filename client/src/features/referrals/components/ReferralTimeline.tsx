import { Check, X } from "lucide-react";
import type { TimelineStep } from "@/features/referrals/types/referral.types";
import { cn } from "@/lib/utils";

interface ReferralTimelineProps {
  steps: TimelineStep[];
  timestamp?: string;
}

export function ReferralTimeline({ steps, timestamp }: ReferralTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium",
                step.completed
                  ? step.rejected
                    ? "bg-danger/10 text-danger"
                    : "bg-success/10 text-success"
                  : "border border-border bg-gray-50 text-text-secondary",
              )}
            >
              {step.completed ? (
                step.rejected ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "my-1 h-10 w-px",
                  step.completed && !step.rejected
                    ? "bg-success/40"
                    : "bg-border",
                )}
              />
            )}
          </div>
          <div className="pb-4">
            <p
              className={cn(
                "text-sm font-medium",
                step.completed
                  ? "text-text-primary"
                  : "text-text-secondary",
              )}
            >
              {step.label}
            </p>
            {step.completed && timestamp && (
              <p className="text-xs text-text-secondary">{timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
