import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/features/copilot/types/copilot.types";
import { ChatMessageBubble } from "@/features/copilot/components/ChatMessageBubble";
import { ThinkingIndicator } from "@/features/copilot/components/ThinkingIndicator";

interface ChatMessageListProps {
  messages: ChatMessage[];
  patientId?: string;
  referralId?: string;
  isSending: boolean;
  thinkingMessage: string;
  onSuggestedQuestion?: (question: string) => void;
  onRegenerate?: () => void;
  headerContent?: React.ReactNode;
}

export function ChatMessageList({
  messages,
  patientId,
  referralId,
  isSending,
  thinkingMessage,
  onSuggestedQuestion,
  onRegenerate,
  headerContent,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, headerContent]);

  const lastAssistantIndex = [...messages]
    .map((msg, index) => ({ msg, index }))
    .reverse()
    .find(({ msg }) => msg.role === "assistant")?.index;

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto flex max-w-[900px] flex-col gap-5 px-4 py-5">
        {headerContent}

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

        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
}
