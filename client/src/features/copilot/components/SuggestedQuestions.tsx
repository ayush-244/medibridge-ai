import { motion } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect?: (question: string) => void;
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        <MessageSquarePlus className="h-3.5 w-3.5" />
        Suggested Questions
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <Button
            key={question}
            variant="secondary"
            size="sm"
            className="h-auto rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-xs font-normal text-text-primary transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            onClick={() => onSelect?.(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
