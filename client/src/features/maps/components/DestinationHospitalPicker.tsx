import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { hasHospitalCoordinates } from "@/features/hospitals/utils/hospitalUtils";
import { calculateDistance, calculateETA } from "@/features/maps/services/maps.service";
import type { DestinationSortMode } from "@/features/maps/types/maps.types";
import { formatDistance } from "@/features/maps/utils/geoUtils";
import { cn } from "@/lib/utils";

interface DestinationHospitalPickerProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  sourceHospitalId: string;
  value: string;
  requiredSpecialty?: string;
  error?: string;
  onChange: (hospitalId: string) => void;
}

interface EnrichedHospitalOption {
  hospital: Hospital;
  distanceKm: number | null;
  etaText: string | null;
  matchesSpecialty: boolean;
}

const SORT_OPTIONS: { value: DestinationSortMode; label: string }[] = [
  { value: "nearest", label: "Nearest" },
  { value: "most_beds", label: "Most Beds" },
  { value: "same_specialty", label: "Same Specialty" },
];

export function DestinationHospitalPicker({
  hospitals,
  doctors,
  sourceHospitalId,
  value,
  requiredSpecialty = "",
  error,
  onChange,
}: DestinationHospitalPickerProps) {
  const [sortMode, setSortMode] = useState<DestinationSortMode>("nearest");
  const [etaMap, setEtaMap] = useState<Record<string, string>>({});
  const [isCalculatingEta, setIsCalculatingEta] = useState(false);

  const sourceHospital = hospitals.find(
    (hospital) => hospital._id === sourceHospitalId,
  );

  const destinationOptions = useMemo(() => {
    return hospitals.filter((hospital) => hospital._id !== sourceHospitalId);
  }, [hospitals, sourceHospitalId]);

  const specialtyByHospital = useMemo(() => {
    return doctors.reduce<Record<string, Set<string>>>((acc, doctor) => {
      const hospitalId =
        typeof doctor.hospital === "string"
          ? doctor.hospital
          : doctor.hospital._id;

      if (!acc[hospitalId]) {
        acc[hospitalId] = new Set();
      }
      acc[hospitalId].add(doctor.specialization);
      return acc;
    }, {});
  }, [doctors]);

  const enrichedOptions = useMemo<EnrichedHospitalOption[]>(() => {
    const sourceHasCoords =
      sourceHospital && hasHospitalCoordinates(sourceHospital);

    return destinationOptions.map((hospital) => {
      const hasCoords = hasHospitalCoordinates(hospital);
      const distanceKm =
        sourceHasCoords && hasCoords
          ? calculateDistance(
              {
                latitude: sourceHospital!.location!.latitude,
                longitude: sourceHospital!.location!.longitude,
              },
              {
                latitude: hospital.location!.latitude,
                longitude: hospital.location!.longitude,
              },
            )
          : null;

      const hospitalSpecialties = specialtyByHospital[hospital._id];
      const matchesSpecialty = requiredSpecialty
        ? Boolean(hospitalSpecialties?.has(requiredSpecialty))
        : false;

      return {
        hospital,
        distanceKm,
        etaText: etaMap[hospital._id] || null,
        matchesSpecialty,
      };
    });
  }, [
    destinationOptions,
    sourceHospital,
    etaMap,
    requiredSpecialty,
    specialtyByHospital,
  ]);

  useEffect(() => {
    if (!sourceHospital || !hasHospitalCoordinates(sourceHospital)) {
      setEtaMap({});
      return;
    }

    let cancelled = false;
    setIsCalculatingEta(true);

    const loadEtas = async () => {
      const nextEtaMap: Record<string, string> = {};

      await Promise.all(
        destinationOptions
          .filter(hasHospitalCoordinates)
          .map(async (hospital) => {
            try {
              const result = await calculateETA(
                {
                  latitude: sourceHospital.location!.latitude,
                  longitude: sourceHospital.location!.longitude,
                },
                {
                  latitude: hospital.location!.latitude,
                  longitude: hospital.location!.longitude,
                },
              );
              nextEtaMap[hospital._id] = result.durationText;
            } catch {
              nextEtaMap[hospital._id] = "—";
            }
          }),
      );

      if (!cancelled) {
        setEtaMap(nextEtaMap);
        setIsCalculatingEta(false);
      }
    };

    void loadEtas();

    return () => {
      cancelled = true;
    };
  }, [sourceHospital, destinationOptions]);

  const sortedOptions = useMemo(() => {
    const options = [...enrichedOptions];

    options.sort((a, b) => {
      if (sortMode === "most_beds") {
        return b.hospital.availableBeds - a.hospital.availableBeds;
      }

      if (sortMode === "same_specialty") {
        const aMatch = a.matchesSpecialty ? 1 : 0;
        const bMatch = b.matchesSpecialty ? 1 : 0;
        if (aMatch !== bMatch) {
          return bMatch - aMatch;
        }
      }

      const aDistance = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
      const bDistance = b.distanceKm ?? Number.MAX_SAFE_INTEGER;
      return aDistance - bDistance;
    });

    return options;
  }, [enrichedOptions, sortMode]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium">Destination Hospital</label>
        <Select
          value={sortMode}
          onValueChange={(nextValue) =>
            setSortMode(nextValue as DestinationSortMode)
          }
        >
          <SelectTrigger className="h-8 w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isCalculatingEta && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Calculating travel times...
        </div>
      )}

      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
        {sortedOptions.length === 0 ? (
          <p className="py-4 text-center text-sm text-text-secondary">
            No destination hospitals available.
          </p>
        ) : (
          sortedOptions.map(({ hospital, distanceKm, etaText }) => (
            <button
              key={hospital._id}
              type="button"
              onClick={() => onChange(hospital._id)}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left transition-colors",
                value === hospital._id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:bg-muted/50",
              )}
            >
              <div className="flex items-start gap-3">
                <HospitalAvatar hospital={hospital} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{hospital.name}</p>
                  <p className="text-xs text-text-secondary">
                    {hospital.city} · {hospital.availableBeds} beds available
                  </p>
                  <div className="mt-1 flex gap-3 text-xs text-text-secondary">
                    <span>
                      Distance:{" "}
                      {distanceKm != null ? formatDistance(distanceKm) : "—"}
                    </span>
                    <span>ETA: {etaText || "—"}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
