import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { QUICK_STARTERS } from "@/features/copilot/types/copilot.types";

interface CopilotEmptyStateProps {
  onQuickStart: (question: string) => void;
  disabled?: boolean;
  snapshotContent?: React.ReactNode;
}

export function CopilotEmptyState({
  onQuickStart,
  disabled,
  snapshotContent,
}: CopilotEmptyStateProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex max-w-[900px] flex-col items-center px-4 py-8">
        {snapshotContent}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 w-full"
        >
          <p className="mb-4 flex items-center justify-center gap-2 text-center text-sm text-text-secondary">
            <Sparkles className="h-4 w-4 text-primary" />
            Start a conversation or try a suggested question
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK_STARTERS.map((starter, index) => (
              <motion.button
                key={starter.label}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04 }}
                disabled={disabled}
                onClick={() => onQuickStart(starter.question)}
                className="rounded-xl border border-primary/10 bg-white/70 px-4 py-3 text-left text-sm text-text-primary shadow-sm transition-all hover:border-primary/25 hover:bg-primary/5 hover:shadow-md disabled:opacity-50"
              >
                {starter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
