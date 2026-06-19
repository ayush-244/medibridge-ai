import { useEffect, useMemo, useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LeafletMapContainer } from "@/features/maps/components/LeafletMapContainer";
import type { HospitalLocation } from "@/features/hospitals/types/hospital.types";

interface LocationPickerMapProps {
  value: HospitalLocation | null;
  onChange: (location: HospitalLocation) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
}

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

function MapClickHandler({
  onSelect,
}: {
  onSelect: (location: HospitalLocation) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

async function searchAddress(query: string): Promise<{
  location: HospitalLocation;
  displayName: string;
} | null> {
  const encoded = encodeURIComponent(query.trim());
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) return null;

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) return null;

  return {
    location: {
      latitude: Number(Number(results[0].lat).toFixed(6)),
      longitude: Number(Number(results[0].lon).toFixed(6)),
    },
    displayName: results[0].display_name,
  };
}

export function LocationPickerMap({
  value,
  onChange,
  onAddressChange,
  className,
}: LocationPickerMapProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const center = useMemo(() => {
    if (value) {
      return { lat: value.latitude, lng: value.longitude };
    }
    return DEFAULT_CENTER;
  }, [value]);

  useEffect(() => {
    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            latitude: Number(position.coords.latitude.toFixed(6)),
            longitude: Number(position.coords.longitude.toFixed(6)),
          });
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }, [onChange, value]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const result = await searchAddress(searchQuery);
      if (!result) {
        setSearchError("No results found for this address.");
        return;
      }

      onChange(result.location);
      onAddressChange?.(result.displayName);
    } catch {
      setSearchError("Address search failed. Try again or click the map.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search address..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSearch();
            }
          }}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleSearch()}
          disabled={isSearching}
          className="gap-2 shrink-0"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {searchError && (
        <p className="text-sm text-danger">{searchError}</p>
      )}

      <LeafletMapContainer center={center} zoom={value ? 14 : 5} className={className}>
        <MapClickHandler onSelect={onChange} />
        {value && (
          <Marker position={[value.latitude, value.longitude]} />
        )}
      </LeafletMapContainer>

      <p className="text-xs text-text-secondary">
        Click the map to place a marker or search for an address above.
      </p>

      {value && (
        <div className="rounded-lg border border-border px-4 py-3 text-sm">
          <p className="text-text-secondary">Selected coordinates</p>
          <p className="font-medium text-text-primary">
            Latitude: {value.latitude.toFixed(6)}
          </p>
          <p className="font-medium text-text-primary">
            Longitude: {value.longitude.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
