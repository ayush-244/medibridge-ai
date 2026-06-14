import { useCallback, useEffect, useState } from "react";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import type { NearbyHospital } from "@/features/hospitals/types/hospital.types";
import { showErrorToast } from "@/lib/toast";

interface UseNearbyHospitalsOptions {
  latitude: number | null;
  longitude: number | null;
  radius?: number;
  enabled?: boolean;
}

interface UseNearbyHospitalsReturn {
  hospitals: NearbyHospital[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNearbyHospitals({
  latitude,
  longitude,
  radius = 100,
  enabled = true,
}: UseNearbyHospitalsOptions): UseNearbyHospitalsReturn {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(async () => {
    if (!enabled || latitude == null || longitude == null) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await hospitalService.getNearby({
        latitude,
        longitude,
        radius,
      });
      setHospitals(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Failed to load nearby hospitals";
      setError(message);
      setHospitals([]);
      showErrorToast(message);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, latitude, longitude, radius]);

  useEffect(() => {
    void fetchNearby();
  }, [fetchNearby]);

  return { hospitals, isLoading, error, refetch: fetchNearby };
}
