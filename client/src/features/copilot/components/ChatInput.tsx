import { Paperclip, Send } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent, type Ref } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask anything about this patient...",
  inputRef: externalRef,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 shrink-0 border-t border-white/40 bg-gradient-to-t from-white via-white/95 to-white/80 px-4 py-3 backdrop-blur-xl">
      <form onSubmit={handleSubmit} className="mx-auto max-w-[900px]">
        <div className="flex items-end gap-2 rounded-2xl border border-border/40 bg-white/90 p-2 shadow-lg shadow-slate-200/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled
            className="h-10 w-10 shrink-0 rounded-xl text-text-secondary"
            aria-label="Attach file (coming soon)"
            title="Attachment support coming soon"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="min-h-[44px] max-h-32 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-sm shadow-none focus-visible:ring-0"
            aria-label="Clinical question input"
          />

          <Button
            type="submit"
            disabled={disabled || !value.trim()}
            className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-sky-600 shadow-md hover:shadow-lg"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
