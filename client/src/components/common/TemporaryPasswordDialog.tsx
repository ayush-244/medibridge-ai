import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemporaryPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  title?: string;
  description?: string;
}

export function TemporaryPasswordDialog({
  open,
  onOpenChange,
  password,
  title = "Temporary Password Generated",
  description = "Share this password securely with the user. They will be required to change it on first login.",
}: TemporaryPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-text-secondary">Temporary password</p>
          <p className="mt-1 font-mono text-lg font-semibold text-text-primary">
            {password}
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
