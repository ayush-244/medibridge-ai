import { useCallback, useState } from "react";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { showErrorToast } from "@/lib/toast";

interface UseHospitalDetailReturn {
  hospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
  fetchHospital: (id: string) => Promise<void>;
  clearHospital: () => void;
}

export function useHospitalDetail(): UseHospitalDetailReturn {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHospital = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await hospitalService.getById(id);
      setHospital(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load hospital details";
      setError(message);
      setHospital(null);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHospital = useCallback(() => {
    setHospital(null);
    setError(null);
  }, []);

  return { hospital, isLoading, error, fetchHospital, clearHospital };
}
