import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { LeafletMapContainer } from "@/features/maps/components/LeafletMapContainer";
import { MapMissingCoordinatesState } from "@/features/maps/components/MapStatusStates";
import type { HospitalLocation } from "@/features/hospitals/types/hospital.types";
import { getGoogleMapsUrl } from "@/features/hospitals/utils/hospitalUtils";
import { toLatLngLiteral } from "@/features/maps/utils/geoUtils";

interface HospitalLocationMapProps {
  name: string;
  location?: HospitalLocation | null;
  className?: string;
}

export function HospitalLocationMap({
  name,
  location,
  className,
}: HospitalLocationMapProps) {
  const center = useMemo(() => {
    if (!location) {
      return { lat: 0, lng: 0 };
    }
    return toLatLngLiteral(location);
  }, [location]);

  if (!location?.latitude || location.longitude == null) {
    return <MapMissingCoordinatesState className={className} />;
  }

  return (
    <div className="space-y-3">
      <LeafletMapContainer center={center} zoom={14} className={className}>
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>{name}</Popup>
        </Marker>
      </LeafletMapContainer>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-4 py-3 text-sm">
        <div>
          <p className="text-text-secondary">Coordinates</p>
          <p className="font-medium text-text-primary">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            window.open(
              getGoogleMapsUrl(location.latitude, location.longitude),
              "_blank",
              "noopener,noreferrer",
            )
          }
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
}
