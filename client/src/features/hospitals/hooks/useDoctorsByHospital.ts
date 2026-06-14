import { useCallback, useEffect, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

export function useDoctorsByHospital(hospitalId: string | null) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    if (!hospitalId) {
      setDoctors([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorService.getByHospital(hospitalId);
      setDoctors(data);
    } catch (err) {
      setError(
        (err as { message?: string })?.message || "Failed to load doctors",
      );
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  const debouncedRefetch = useDebouncedCallback(() => {
    void fetchDoctors();
  }, 500);

  useSocketEvent(
    SOCKET_EVENTS.DOCTOR_UPDATED,
    debouncedRefetch,
    Boolean(hospitalId),
  );

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, isLoading, error, refetch: fetchDoctors };
}
