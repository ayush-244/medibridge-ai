import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import { LeafletMapContainer } from "@/features/maps/components/LeafletMapContainer";
import type { HospitalMapMarkerData } from "@/features/maps/types/maps.types";

interface HospitalMarkersMapProps {
  markers: HospitalMapMarkerData[];
  className?: string;
  selectedId?: string | null;
  onSelect?: (marker: HospitalMapMarkerData | null) => void;
}

function HospitalInfoContent({ marker }: { marker: HospitalMapMarkerData }) {
  return (
    <div className="min-w-[220px] max-w-[280px] space-y-2 p-1">
      <div className="flex items-center gap-3">
        <HospitalAvatar
          hospital={{ name: marker.name, logo: marker.logo }}
          size="md"
        />
        <div>
          <p className="font-semibold text-text-primary">{marker.name}</p>
          <p className="text-xs text-text-secondary">
            {marker.city}, {marker.state}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-text-secondary">Available Beds</p>
          <p className="font-medium text-text-primary">{marker.availableBeds}</p>
        </div>
        <div>
          <p className="text-text-secondary">Available Doctors</p>
          <p className="font-medium text-text-primary">
            {marker.availableDoctors}
          </p>
        </div>
      </div>
      <div className="text-xs">
        <p className="text-text-secondary">Coordinates</p>
        <p className="font-medium text-text-primary">
          {marker.location.latitude.toFixed(6)},{" "}
          {marker.location.longitude.toFixed(6)}
        </p>
      </div>
      {marker.specializations.length > 0 && (
        <div>
          <p className="text-xs text-text-secondary">Specializations</p>
          <p className="text-xs font-medium text-text-primary">
            {marker.specializations.slice(0, 4).join(", ")}
            {marker.specializations.length > 4 ? "…" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

function FitMarkerBounds({ markers }: { markers: HospitalMapMarkerData[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      map.setView(
        [markers[0].location.latitude, markers[0].location.longitude],
        12,
      );
      return;
    }

    const bounds = L.latLngBounds(
      markers.map(
        (marker) =>
          [marker.location.latitude, marker.location.longitude] as [
            number,
            number,
          ],
      ),
    );
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, markers]);

  return null;
}

function PanToSelected({
  selectedId,
  markers,
}: {
  selectedId?: string | null;
  markers: HospitalMapMarkerData[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const selectedMarker = markers.find((marker) => marker.id === selectedId);
    if (!selectedMarker) {
      return;
    }

    map.panTo([
      selectedMarker.location.latitude,
      selectedMarker.location.longitude,
    ]);
  }, [map, selectedId, markers]);

  return null;
}

export function HospitalMarkersMap({
  markers,
  className,
  selectedId,
  onSelect,
}: HospitalMarkersMapProps) {
  const center = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 20.5937, lng: 78.9629 };
    }

    const avgLat =
      markers.reduce((sum, marker) => sum + marker.location.latitude, 0) /
      markers.length;
    const avgLng =
      markers.reduce((sum, marker) => sum + marker.location.longitude, 0) /
      markers.length;

    return { lat: avgLat, lng: avgLng };
  }, [markers]);

  return (
    <LeafletMapContainer
      center={center}
      zoom={markers.length === 1 ? 12 : 6}
      className={className}
    >
      <FitMarkerBounds markers={markers} />
      <PanToSelected selectedId={selectedId} markers={markers} />
      {markers.map((markerData) => (
        <Marker
          key={markerData.id}
          position={[
            markerData.location.latitude,
            markerData.location.longitude,
          ]}
          eventHandlers={{
            click: () => onSelect?.(markerData),
          }}
        >
          <Popup>
            <HospitalInfoContent marker={markerData} />
          </Popup>
        </Marker>
      ))}
    </LeafletMapContainer>
  );
}

export { HospitalInfoContent };
