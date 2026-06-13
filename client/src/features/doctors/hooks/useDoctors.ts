import { useCallback, useEffect, useState } from "react";
import { doctorService } from "@/features/doctors/services/doctor.service";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import { showErrorToast } from "@/lib/toast";

interface UseDoctorsReturn {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDoctors(): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load doctors";
      setError(message);
      setDoctors([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, isLoading, error, refetch: fetchDoctors };
}
