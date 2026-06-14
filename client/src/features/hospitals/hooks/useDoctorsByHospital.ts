import { useCallback, useEffect, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { Doctor } from "@/features/doctors/types/doctor.types";

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

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, isLoading, error, refetch: fetchDoctors };
}
