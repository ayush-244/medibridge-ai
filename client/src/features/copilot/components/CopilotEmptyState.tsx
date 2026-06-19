import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUICK_STARTERS } from "@/features/copilot/types/copilot.types";

interface CopilotEmptyStateProps {
  onQuickStart: (question: string) => void;
  disabled?: boolean;
}

export function CopilotEmptyState({ onQuickStart, disabled }: CopilotEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 flex-col items-center justify-center px-6 py-12"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky-600 shadow-xl">
          <Bot className="h-12 w-12 text-white" />
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-semibold text-text-primary">
        Ask anything about your patient&apos;s medical records
      </h2>
      <p className="mb-8 flex items-center gap-2 text-center text-text-secondary">
        <Sparkles className="h-4 w-4 text-primary" />
        Powered by MediBridge Clinical Intelligence
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_STARTERS.map((starter, index) => (
          <motion.div
            key={starter.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="outline"
              disabled={disabled}
              className="h-auto w-full justify-start rounded-xl border-primary/15 bg-white/80 px-4 py-3 text-left text-sm font-normal shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-md"
              onClick={() => onQuickStart(starter.question)}
            >
              {starter.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
