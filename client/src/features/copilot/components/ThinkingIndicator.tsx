import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ThinkingIndicatorProps {
  message: string;
}

export function ThinkingIndicator({ message }: ThinkingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-md rounded-2xl rounded-bl-md border border-border/60 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">{message}</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-primary/60"
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2 animate-pulse rounded bg-slate-100" />
          <div className="h-2 w-4/5 animate-pulse rounded bg-slate-100" />
          <div className="h-2 w-3/5 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    </motion.div>
  );
}
