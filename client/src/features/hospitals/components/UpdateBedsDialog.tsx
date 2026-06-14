import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHospitalMutations } from "@/features/hospitals/hooks/useHospitalMutations";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { showErrorToast } from "@/lib/toast";

interface UpdateBedsDialogProps {
  hospital: Hospital | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpdateBedsDialog({
  hospital,
  open,
  onOpenChange,
  onSuccess,
}: UpdateBedsDialogProps) {
  const { isSubmitting, updateBeds } = useHospitalMutations();
  const [availableBeds, setAvailableBeds] = useState("");
  const [availableICUBeds, setAvailableICUBeds] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && hospital) {
      setAvailableBeds(String(hospital.availableBeds));
      setAvailableICUBeds(String(hospital.availableICUBeds));
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;

    const beds = Number(availableBeds);
    const icuBeds = Number(availableICUBeds);

    if (beds > hospital.totalBeds) {
      showErrorToast("Available beds cannot exceed total beds");
      return;
    }
    if (icuBeds > hospital.totalICUBeds) {
      showErrorToast("Available ICU beds cannot exceed total ICU beds");
      return;
    }

    const updated = await updateBeds(hospital._id, beds, icuBeds);
    if (updated) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Bed Availability</DialogTitle>
          <DialogDescription>
            {hospital
              ? `Adjust available beds for ${hospital.name}`
              : "Update bed counts"}
          </DialogDescription>
        </DialogHeader>
        {hospital && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Available Beds (max {hospital.totalBeds})
              </label>
              <Input
                type="number"
                min={0}
                max={hospital.totalBeds}
                value={availableBeds}
                onChange={(e) => setAvailableBeds(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Available ICU Beds (max {hospital.totalICUBeds})
              </label>
              <Input
                type="number"
                min={0}
                max={hospital.totalICUBeds}
                value={availableICUBeds}
                onChange={(e) => setAvailableICUBeds(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Beds"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
