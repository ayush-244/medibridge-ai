import { motion } from "framer-motion";
import { Activity, Copy, RefreshCw, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/features/copilot/types/copilot.types";
import {
  formatMessageTime,
} from "@/features/copilot/utils/copilotUtils";
import { SuggestedQuestions } from "@/features/copilot/components/SuggestedQuestions";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  patientId: string;
  referralId?: string;
  onSuggestedQuestion?: (question: string) => void;
  onRegenerate?: () => void;
  isLatestAssistant?: boolean;
}

export function ChatMessageBubble({
  message,
  onSuggestedQuestion,
  onRegenerate,
  isLatestAssistant,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[92%] space-y-3 sm:max-w-[85%] lg:max-w-[78%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md",
            isUser
              ? "rounded-br-md bg-gradient-to-br from-primary to-sky-600 text-white"
              : "rounded-bl-md border border-border/60 bg-white/90 backdrop-blur-sm",
          )}
        >
          {!isUser && message.summary && (
            <div className="mb-3 rounded-lg border border-primary/10 bg-primary/5 p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Clinical Summary
              </p>
              <p className="text-sm text-text-primary">{message.summary}</p>
            </div>
          )}

          {!isUser && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
              Answer
            </p>
          )}

          <div
            className={cn(
              "prose prose-sm max-w-none text-sm leading-relaxed",
              isUser ? "prose-invert text-white" : "text-text-primary",
            )}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {!isUser && message.evidence && message.evidence.length > 0 && (
            <div className="mt-4 border-t border-border/50 pt-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Supporting Evidence
              </p>
              <ul className="space-y-1">
                {message.evidence.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-text-primary"
                  >
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isUser && message.confidence !== undefined && (
            <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Confidence
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "font-semibold",
                  message.confidence >= 85
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : message.confidence >= 60
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700",
                )}
              >
                {message.confidence}%
              </Badge>
            </div>
          )}

          {!isUser && showSources && message.citations && message.citations.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Sources
              </p>
              <ul className="space-y-1">
                {message.citations.map((citation) => (
                  <li key={`${citation.fileName}-${citation.chunkIndex}`} className="text-sm">
                    <span className="font-medium text-text-primary">{citation.fileName}</span>
                    <span className="text-text-secondary"> · chunk {citation.chunkIndex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center gap-2 px-1",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          <span className="text-xs text-text-secondary">
            {formatMessageTime(message.createdAt)}
          </span>

          {!isUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => void handleCopy()}
                aria-label="Copy response"
              >
                <Copy className="mr-1 h-3 w-3" />
                {copied ? "Copied" : "Copy"}
              </Button>

              {isLatestAssistant && onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Regenerate
                </Button>
              )}

              {message.citations && message.citations.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setShowSources((prev) => !prev)}
                  aria-label="View sources"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {showSources ? "Hide Sources" : "View Sources"}
                </Button>
              )}
            </>
          )}
        </div>

        {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <SuggestedQuestions
            questions={message.suggestedQuestions}
            onSelect={onSuggestedQuestion}
          />
        )}
      </div>
    </motion.div>
  );
}
