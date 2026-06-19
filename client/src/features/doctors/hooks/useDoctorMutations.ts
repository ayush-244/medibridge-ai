import { useCallback, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type {
  CreateDoctorPayload,
  CreateDoctorResult,
  Doctor,
  UpdateDoctorPayload,
} from "@/features/doctors/types/doctor.types";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

export function useDoctorMutations() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDoctor = useCallback(async (payload: CreateDoctorPayload) => {
    setIsSubmitting(true);
    try {
      const result = await doctorService.create(payload);
      showSuccessToast(`Doctor ${result.doctor.name} created`);
      return result;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to create doctor",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateDoctor = useCallback(
    async (id: string, payload: UpdateDoctorPayload) => {
      setIsSubmitting(true);
      try {
        const doctor = await doctorService.update(id, payload);
        showSuccessToast(`Doctor ${doctor.name} updated`);
        return doctor;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message || "Failed to update doctor",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const uploadDoctorPhoto = useCallback(async (file: File) => {
    setIsSubmitting(true);
    try {
      return await doctorService.uploadPhoto(file);
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to upload photo",
      );
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const toggleAvailability = useCallback(
    async (doctor: Doctor) => {
      const newStatus = doctor.status === "AVAILABLE" ? "OFF_DUTY" : "AVAILABLE";
      return updateDoctor(doctor._id, { status: newStatus });
    },
    [updateDoctor],
  );

  return {
    isSubmitting,
    createDoctor,
    updateDoctor,
    uploadDoctorPhoto,
    toggleAvailability,
  };
}

export type { CreateDoctorResult };
