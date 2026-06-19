import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
  Plus,
  Stethoscope,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { ChatSession } from "@/features/copilot/types/copilot.types";
import { cn } from "@/lib/utils";

interface CopilotSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLoading?: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onQuickAction: (question: string) => void;
}

export function CopilotSidebar({
  sessions,
  activeSessionId,
  isLoading,
  onSelectSession,
  onNewSession,
  onQuickAction,
}: CopilotSidebarProps) {
  const quickActions = [
    { label: "Summarize Patient", question: "Summarize this patient's medical records." },
    { label: "Show Medications", question: "What medications is the patient taking?" },
    { label: "Recommend Specialist", question: "Which specialist is recommended?" },
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-border/60 bg-white/60 backdrop-blur-sm lg:w-72">
      <div className="p-4">
        <Button
          onClick={onNewSession}
          className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-600 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <Separator />

      <div className="px-4 py-3">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <Clock className="h-3.5 w-3.5" />
          Recent Conversations
        </h3>

        <ScrollArea className="h-64 lg:h-[calc(100vh-420px)]">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="text-sm text-text-secondary">No conversations yet.</p>
          )}

          <ul className="space-y-1">
            {sessions.map((session) => (
              <motion.li
                key={session._id}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session._id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                    activeSessionId === session._id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-sm font-medium">
                      {session.patientId}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {session.title}
                  </p>
                </button>
              </motion.li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <Separator />

      <div className="p-4">
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
          <MessageSquare className="h-3.5 w-3.5" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              size="sm"
              className="h-auto w-full justify-start rounded-lg py-2 text-xs"
              onClick={() => onQuickAction(action.question)}
            >
              <Stethoscope className="mr-2 h-3.5 w-3.5 text-primary" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
