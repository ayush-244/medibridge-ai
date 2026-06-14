import { useCallback, useState } from "react";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import type {
  CreateHospitalPayload,
  Hospital,
  UpdateHospitalPayload,
} from "@/features/hospitals/types/hospital.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function useHospitalMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHospital = useCallback(async (payload: CreateHospitalPayload) => {
    setIsSubmitting(true);
    try {
      const hospital = await hospitalService.create(payload);
      showSuccessToast(`Hospital ${hospital.name} created`);
      return hospital;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to create hospital",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateHospital = useCallback(
    async (id: string, payload: UpdateHospitalPayload) => {
      setIsSubmitting(true);
      try {
        const hospital = await hospitalService.update(id, payload);
        showSuccessToast(`Hospital ${hospital.name} updated`);
        return hospital;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message || "Failed to update hospital",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const updateBeds = useCallback(
    async (id: string, availableBeds: number, availableICUBeds: number) => {
      setIsSubmitting(true);
      try {
        const hospital = await hospitalService.updateBeds(id, {
          availableBeds,
          availableICUBeds,
        });
        showSuccessToast("Bed availability updated");
        return hospital;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message ||
            "Failed to update bed availability",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { isSubmitting, createHospital, updateHospital, updateBeds };
}

export type { Hospital };
