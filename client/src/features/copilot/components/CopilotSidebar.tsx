import { motion } from "framer-motion";
import {
  Clock,
  MessageSquare,
  Plus,
  Stethoscope,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatSession } from "@/features/copilot/types/copilot.types";
import { cn } from "@/lib/utils";

const DEMO_PATIENTS = ["PATIENT002", "PATIENT001"];

interface CopilotSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  patientId: string;
  isLoading?: boolean;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onQuickAction: (question: string) => void;
  onPatientChange: (patientId: string) => void;
}

export function CopilotSidebar({
  sessions,
  activeSessionId,
  patientId,
  isLoading,
  onSelectSession,
  onNewSession,
  onQuickAction,
  onPatientChange,
}: CopilotSidebarProps) {
  const quickActions = [
    { label: "Summarize Patient", question: "Summarize this patient's medical records." },
    { label: "Show Medications", question: "What medications is the patient taking?" },
    { label: "Recommend Specialist", question: "Which specialist is recommended?" },
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/40 bg-white/50 backdrop-blur-md lg:w-[20%] lg:min-w-[240px] lg:max-w-[320px]">
      <div className="shrink-0 space-y-3 p-3">
        <Button
          onClick={onNewSession}
          className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-600 shadow-md transition-shadow hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <div className="space-y-1.5">
          <label
            htmlFor="copilot-patient-switcher"
            className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary"
          >
            Patient Switcher
          </label>
          <div className="flex gap-1.5">
            <Input
              id="copilot-patient-switcher"
              value={patientId}
              onChange={(event) => onPatientChange(event.target.value)}
              placeholder="PATIENT002"
              className="h-8 rounded-lg border-border/40 bg-white/80 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {DEMO_PATIENTS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onPatientChange(id)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] transition-colors",
                  patientId === id
                    ? "bg-primary/15 font-medium text-primary"
                    : "bg-slate-100 text-text-secondary hover:bg-primary/10",
                )}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
        <h3 className="mb-2 flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          <Clock className="h-3.5 w-3.5" />
          Recent Conversations
        </h3>

        <ScrollArea className="min-h-0 flex-1">
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100/80" />
              ))}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="text-xs text-text-secondary">No conversations yet.</p>
          )}

          <ul className="space-y-0.5 pr-2">
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
                    "w-full rounded-lg px-2.5 py-2 text-left transition-colors",
                    activeSessionId === session._id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-white/80",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 shrink-0 opacity-60" />
                    <span className="truncate text-xs font-medium">
                      {session.patientId}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate pl-5 text-[10px] text-text-secondary">
                    {session.title}
                  </p>
                </button>
              </motion.li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="shrink-0 border-t border-white/40 p-3">
        <h3 className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          <MessageSquare className="h-3.5 w-3.5" />
          Quick Actions
        </h3>
        <div className="space-y-1.5">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start rounded-lg py-1.5 text-xs hover:bg-white/80"
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
