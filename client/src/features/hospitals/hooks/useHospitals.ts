import { useCallback, useEffect, useState } from "react";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { showErrorToast } from "@/lib/toast";

interface UseHospitalsReturn {
  hospitals: Hospital[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHospitals(): UseHospitalsReturn {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await hospitalService.getAll();
      setHospitals(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message || "Failed to load hospitals";
      setError(message);
      setHospitals([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  return { hospitals, isLoading, error, refetch: fetchHospitals };
}
