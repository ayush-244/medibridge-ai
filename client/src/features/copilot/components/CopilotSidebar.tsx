import { motion } from "framer-motion";
import { Clock, MessageSquare, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopilot } from "@/features/copilot/context/CopilotContext";
import { cn } from "@/lib/utils";

export function CopilotSidebar() {
  const {
    activeSession,
    startNewChat,
    sendMessage,
  } = useCopilot();

  const quickActions = [
    { label: "Summarize Patient", question: "Summarize this patient's medical records." },
    { label: "Show Medications", question: "What medications is the patient taking?" },
    { label: "Recommend Specialist", question: "Which specialist is recommended?" },
    { label: "Generate Referral Note", question: "Generate a referral note for this patient." },
    { label: "Follow-Up Plan", question: "What follow-up care is required?" },
  ];

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/40 bg-white/50 backdrop-blur-md lg:w-[20%] lg:min-w-[240px] lg:max-w-[320px]">
      <div className="shrink-0 space-y-3 p-3">
        <Button
          onClick={startNewChat}
          className="w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-600 shadow-md transition-shadow hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
        <h3 className="mb-2 flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
          <Clock className="h-3.5 w-3.5" />
          Current Conversation
        </h3>

        <ScrollArea className="min-h-0 flex-1">
          {activeSession ? (
            <ul className="space-y-0.5 pr-2">
              <motion.li whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-lg px-2.5 py-2 text-left transition-colors",
                    "bg-primary/10 text-primary",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 shrink-0 opacity-60" />
                    <span className="truncate text-xs font-medium">
                      {activeSession.patientName || activeSession.patientId}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate pl-5 text-[10px] text-text-secondary">
                    {activeSession.title}
                  </p>
                </button>
              </motion.li>
            </ul>
          ) : (
            <p className="text-xs text-text-secondary">No active conversation.</p>
          )}
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
              onClick={() => void sendMessage(action.question)}
            >
              <MessageSquare className="mr-2 h-3.5 w-3.5 text-primary" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  );
}
