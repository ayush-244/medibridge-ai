import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage } from "@/features/copilot/types/copilot.types";
import { ChatMessageBubble } from "@/features/copilot/components/ChatMessageBubble";
import { ThinkingIndicator } from "@/features/copilot/components/ThinkingIndicator";

interface ChatMessageListProps {
  messages: ChatMessage[];
  patientId: string;
  referralId?: string;
  isSending: boolean;
  thinkingMessage: string;
  onSuggestedQuestion: (question: string) => void;
  onRegenerate: () => void;
}

export function ChatMessageList({
  messages,
  patientId,
  referralId,
  isSending,
  thinkingMessage,
  onSuggestedQuestion,
  onRegenerate,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const lastAssistantIndex = [...messages]
    .map((msg, index) => ({ msg, index }))
    .reverse()
    .find(({ msg }) => msg.role === "assistant")?.index;

  return (
    <ScrollArea className="h-full flex-1 px-4 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {messages.map((message, index) => (
          <ChatMessageBubble
            key={message._id}
            message={message}
            patientId={patientId}
            referralId={referralId}
            onSuggestedQuestion={onSuggestedQuestion}
            onRegenerate={onRegenerate}
            isLatestAssistant={
              message.role === "assistant" && index === lastAssistantIndex
            }
          />
        ))}

        {isSending && <ThinkingIndicator message={thinkingMessage} />}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
