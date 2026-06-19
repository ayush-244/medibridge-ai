import { Send } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask a clinical question about this patient...",
}: ChatInputProps) {
  const [value, setValue] = useState("");

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
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/60 bg-white/80 p-4 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <Textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="min-h-[48px] max-h-32 resize-none rounded-xl border-border/60 bg-white shadow-sm focus-visible:ring-primary/30"
          aria-label="Clinical question input"
        />
        <Button
          type="submit"
          disabled={disabled || !value.trim()}
          className="h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br from-primary to-sky-600 shadow-md hover:shadow-lg"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-text-secondary">
        MediBridge Clinical Copilot uses uploaded medical records only. Press Enter to send.
      </p>
    </form>
  );
}
