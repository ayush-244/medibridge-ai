import { Loader2 } from "lucide-react";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import type { NearbyHospital } from "@/features/hospitals/types/hospital.types";
import { formatDistance } from "@/features/maps/utils/geoUtils";

interface NearbyHospitalsPanelProps {
  hospitals: NearbyHospital[];
  isLoading: boolean;
  selectedId?: string | null;
  onSelect?: (hospitalId: string) => void;
  etaByHospitalId?: Record<string, string>;
}

export function NearbyHospitalsPanel({
  hospitals,
  isLoading,
  selectedId,
  onSelect,
  etaByHospitalId = {},
}: NearbyHospitalsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-secondary">
        No hospitals found within the selected radius.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {hospitals.map((hospital) => (
        <button
          key={hospital._id}
          type="button"
          onClick={() => onSelect?.(hospital._id)}
          className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
            selectedId === hospital._id
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <HospitalAvatar hospital={hospital} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-text-primary">
                {hospital.name}
              </p>
              <p className="text-xs text-text-secondary">
                {hospital.city}, {hospital.state}
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-text-secondary">Distance</p>
                  <p className="font-medium">{formatDistance(hospital.distance)}</p>
                </div>
                <div>
                  <p className="text-text-secondary">ETA</p>
                  <p className="font-medium">
                    {etaByHospitalId[hospital._id] || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Beds</p>
                  <p className="font-medium">{hospital.availableBeds}</p>
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
