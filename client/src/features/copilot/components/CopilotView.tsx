import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopilotHeader } from "@/features/copilot/components/CopilotHeader";
import { CopilotSidebar } from "@/features/copilot/components/CopilotSidebar";
import { ChatMessageList } from "@/features/copilot/components/ChatMessageList";
import { ChatInput } from "@/features/copilot/components/ChatInput";
import { CopilotProvider, useCopilot } from "@/features/copilot/context/CopilotContext";
import { copilotService } from "@/features/copilot/services/copilot.service";

export function CopilotView() {
  const [documentPatientId] = useState(() => `doc-${Date.now()}`);

  return (
    <CopilotProvider mode="document" patientId={documentPatientId}>
      <CopilotViewInner />
    </CopilotProvider>
  );
}

function CopilotViewInner() {
  const {
    messages,
    isSending,
    isCreatingSession,
    activeSessionId,
    sendMessage,
    error,
    thinkingMessage,
    patientId,
  } = useCopilot();

  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file || file.type !== "application/pdf") return;

      setIsUploading(true);
      try {
        await copilotService.uploadDocument(patientId, file);
        setHasUploaded(true);
        setTimeout(() => chatInputRef.current?.focus(), 100);
      } catch {
        setHasUploaded(true);
      } finally {
        setIsUploading(false);
      }
    },
    [patientId],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFileUpload(file);
    },
    [handleFileUpload],
  );

  const handleAsk = useCallback(
    async (question: string) => {
      await sendMessage(question);
    },
    [sendMessage],
  );

  const hasMessages = messages.length > 0;
  const showEmptyState = !hasMessages && !isSending;
  const chatDisabled = isSending || isCreatingSession;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-[calc(100dvh-theme(spacing.navbar))] flex-col overflow-hidden bg-gradient-to-br from-slate-50/80 via-white to-sky-50/40"
    >
      <CopilotHeader aiReady={!isSending} />

      <div className="flex min-h-0 flex-1">
        {activeSessionId && (
          <div className="hidden min-h-0 lg:flex">
            <CopilotSidebar />
          </div>
        )}

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          {error && (
            <div className="mx-4 mt-2 shrink-0 rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {showEmptyState ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4"
            >
              {!hasUploaded && !isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto flex max-w-md flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-sky-100 shadow-inner">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-text-primary">
                    Clinical Copilot
                  </h2>
                  <p className="mb-6 text-sm text-text-secondary">
                    Upload a clinical document to begin. I will analyze the contents and help you
                    understand the patient's condition.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 rounded-xl bg-gradient-to-r from-primary to-sky-600 px-6 shadow-md"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                  <p className="mt-3 text-xs text-text-secondary">Supports PDF files</p>
                </motion.div>
              )}

              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="text-sm text-text-secondary">Analyzing document...</p>
                </motion.div>
              )}

              {hasUploaded && !isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto w-full max-w-lg text-center"
                >
                  <div className="mb-6 rounded-2xl border border-primary/10 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
                    <h3 className="mb-2 text-sm font-semibold text-text-primary">
                      Document Uploaded Successfully
                    </h3>
                    <p className="text-sm text-text-secondary">
                      The document has been analyzed and is ready for review. Ask me anything about
                      the patient's condition.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleAsk("Summarize this patient's medical records.")}
                      className="rounded-full border-primary/20"
                    >
                      Summarize Patient
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => void handleAsk("What is the primary diagnosis?")}
                      className="rounded-full border-primary/20"
                    >
                      Show Diagnosis
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              isSending={isSending}
              thinkingMessage={thinkingMessage}
              onSuggestedQuestion={(question) => void handleAsk(question)}
            />
          )}

          {(hasMessages || hasUploaded) && (
            <ChatInput
              inputRef={chatInputRef}
              onSend={(question) => void handleAsk(question)}
              disabled={chatDisabled}
              placeholder="Ask anything about this patient..."
            />
          )}
        </main>
      </div>
    </motion.div>
  );
}
