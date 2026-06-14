import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RESERVATION_DURATIONS, type ReservationDuration } from "@/lib/constants";

interface ExtendReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (duration: ReservationDuration) => void;
  isLoading?: boolean;
}

export function ExtendReservationDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: ExtendReservationDialogProps) {
  const [duration, setDuration] = useState<ReservationDuration>(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Reservation</DialogTitle>
          <DialogDescription>
            Choose how long to extend this bed reservation. Expiry is always
            required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Duration</label>
            <Select
              value={String(duration)}
              onChange={(e) =>
                setDuration(Number(e.target.value) as ReservationDuration)
              }
            >
              {RESERVATION_DURATIONS.map((h) => (
                <option key={h} value={h}>
                  {h} Hour{h > 1 ? "s" : ""}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(duration)}
              disabled={isLoading}
            >
              {isLoading ? "Extending..." : "Extend"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
