import { useEffect, useMemo, useState } from "react";
import { Map, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { filterHospitals } from "@/features/hospitals/utils/hospitalUtils";
import { HospitalInfoContent, HospitalMarkersMap } from "@/features/maps/components/HospitalMarkersMap";
import { MapAnalyticsSection } from "@/features/maps/components/MapAnalyticsSection";
import { NearbyHospitalsPanel } from "@/features/maps/components/NearbyHospitalsPanel";
import { useHospitalMapData } from "@/features/maps/hooks/useHospitalMapData";
import { useNearbyHospitals } from "@/features/maps/hooks/useNearbyHospitals";
import { calculateETA } from "@/features/maps/services/maps.service";
import { useDebounce } from "@/hooks/useDebounce";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";

export function MapsView() {
  const { hospitals, isLoading, error, refetch } = useHospitals();
  const { doctors, refetch: refetchDoctors } = useDoctors();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [radius, setRadius] = useState("50");
  const [referenceLat, setReferenceLat] = useState("");
  const [referenceLng, setReferenceLng] = useState("");
  const [etaByHospitalId, setEtaByHospitalId] = useState<Record<string, string>>(
    {},
  );

  const debouncedSearch = useDebounce(search, 300);
  const filteredHospitals = useMemo(
    () => filterHospitals(hospitals, debouncedSearch),
    [hospitals, debouncedSearch],
  );

  const { markers, analytics, hospitalsWithCoordinates, hospitalsMissingCoordinates } =
    useHospitalMapData(filteredHospitals, doctors);

  const selectedMarker = markers.find((marker) => marker.id === selectedId) || null;

  const nearbyLatitude =
    referenceLat.trim() !== "" ? Number(referenceLat) : selectedMarker?.location.latitude ?? null;
  const nearbyLongitude =
    referenceLng.trim() !== "" ? Number(referenceLng) : selectedMarker?.location.longitude ?? null;

  const {
    hospitals: nearbyHospitals,
    isLoading: nearbyLoading,
    refetch: refetchNearby,
  } = useNearbyHospitals({
    latitude: nearbyLatitude,
    longitude: nearbyLongitude,
    radius: Number(radius) || 50,
    enabled: nearbyLatitude != null && nearbyLongitude != null,
  });

  const debouncedRefresh = useDebouncedCallback(() => {
    void refetch({ silent: true });
    void refetchDoctors();
    void refetchNearby();
  }, 500);

  useSocketEvent(SOCKET_EVENTS.HOSPITAL_UPDATED, debouncedRefresh);

  useEffect(() => {
    if (nearbyLatitude == null || nearbyLongitude == null) {
      setEtaByHospitalId({});
      return;
    }

    let cancelled = false;

    const loadEtas = async () => {
      const nextMap: Record<string, string> = {};

      await Promise.all(
        nearbyHospitals.map(async (hospital) => {
          if (!hospital.location) return;

          try {
            const result = await calculateETA(
              { latitude: nearbyLatitude, longitude: nearbyLongitude },
              {
                latitude: hospital.location.latitude,
                longitude: hospital.location.longitude,
              },
            );
            nextMap[hospital._id] = result.durationText;
          } catch {
            nextMap[hospital._id] = "—";
          }
        }),
      );

      if (!cancelled) {
        setEtaByHospitalId(nextMap);
      }
    };

    void loadEtas();

    return () => {
      cancelled = true;
    };
  }, [nearbyHospitals, nearbyLatitude, nearbyLongitude]);

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Hospital Map"
          description="Geographic view of hospital locations, capacity, and proximity"
        />
        <EmptyState
          title="Failed to load hospitals"
          description={error}
          icon={<Map className="h-6 w-6" />}
          action={
            <Button onClick={() => void refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Hospital Map"
        description="Geographic view of hospital locations, capacity, and proximity"
        action={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={() => {
              void refetch();
              void refetchDoctors();
              void refetchNearby();
            }}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search hospitals by name, city, or state..."
          className="max-w-md"
        />
        {hospitalsMissingCoordinates.length > 0 && (
          <p className="text-sm text-warning">
            {hospitalsMissingCoordinates.length} hospital(s) missing coordinates
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hospital Locations</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px] p-3 pt-0 sm:h-[520px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                Loading hospitals...
              </div>
            ) : markers.length === 0 ? (
              <EmptyState
                title="No mapped hospitals"
                description="Hospitals need latitude and longitude to appear on the map."
                icon={<Map className="h-6 w-6" />}
              />
            ) : (
              <HospitalMarkersMap
                markers={markers}
                selectedId={selectedId}
                onSelect={(marker) => setSelectedId(marker?.id ?? null)}
                className="h-full"
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedMarker && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Selected Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                <HospitalInfoContent marker={selectedMarker} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nearest Hospitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={referenceLat}
                  onChange={(event) => setReferenceLat(event.target.value)}
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={referenceLng}
                  onChange={(event) => setReferenceLng(event.target.value)}
                />
              </div>
              <Input
                type="number"
                min={1}
                placeholder="Radius (km)"
                value={radius}
                onChange={(event) => setRadius(event.target.value)}
              />
              <NearbyHospitalsPanel
                hospitals={nearbyHospitals}
                isLoading={nearbyLoading}
                selectedId={selectedId}
                onSelect={setSelectedId}
                etaByHospitalId={etaByHospitalId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <MapAnalyticsSection
        analytics={analytics}
        totalHospitals={filteredHospitals.length}
        mappedHospitals={hospitalsWithCoordinates.length}
        isLoading={isLoading}
      />
    </div>
  );
}
