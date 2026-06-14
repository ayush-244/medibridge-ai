import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";
import { Marker, Polyline, Popup, useMap } from "react-leaflet";
import { LeafletMapContainer } from "@/features/maps/components/LeafletMapContainer";
import { MapMissingCoordinatesState } from "@/features/maps/components/MapStatusStates";
import type { HospitalLocation } from "@/features/hospitals/types/hospital.types";
import { getRoute } from "@/features/maps/services/maps.service";
import type { LatLngLiteral, RouteResult } from "@/features/maps/types/maps.types";
import { toLatLngLiteral } from "@/features/maps/utils/geoUtils";

interface ReferralRouteMapProps {
  sourceName: string;
  destinationName: string;
  sourceLocation?: HospitalLocation | null;
  destinationLocation?: HospitalLocation | null;
  className?: string;
}

function createLabelIcon(label: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#2563EB;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitRouteBounds({ path }: { path: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (path.length === 0) {
      return;
    }

    if (path.length === 1) {
      map.setView(path[0], 12);
      return;
    }

    const bounds = L.latLngBounds(path);
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [map, path]);

  return null;
}

export function ReferralRouteMap({
  sourceName,
  destinationName,
  sourceLocation,
  destinationLocation,
  className,
}: ReferralRouteMapProps) {
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const hasCoordinates =
    sourceLocation?.latitude != null &&
    sourceLocation?.longitude != null &&
    destinationLocation?.latitude != null &&
    destinationLocation?.longitude != null;

  useEffect(() => {
    if (!hasCoordinates || !sourceLocation || !destinationLocation) {
      return;
    }

    let cancelled = false;
    setIsLoadingRoute(true);
    setRouteError(null);

    getRoute(
      {
        latitude: sourceLocation.latitude,
        longitude: sourceLocation.longitude,
      },
      {
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      },
    )
      .then((result) => {
        if (!cancelled) {
          setRoute(result);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setRouteError(err.message || "Failed to calculate route");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingRoute(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasCoordinates, sourceLocation, destinationLocation]);

  const path = useMemo<[number, number][]>(() => {
    if (!hasCoordinates || !sourceLocation || !destinationLocation) {
      return [];
    }

    const source = toLatLngLiteral(sourceLocation);
    const destination = toLatLngLiteral(destinationLocation);
    const polyline: LatLngLiteral[] = route?.polyline ?? [source, destination];

    return polyline.map((point) => [point.lat, point.lng] as [number, number]);
  }, [hasCoordinates, sourceLocation, destinationLocation, route]);

  if (!hasCoordinates) {
    return (
      <MapMissingCoordinatesState
        className={className}
        title="Route unavailable"
        description="One or both hospitals are missing coordinates required to display the route."
      />
    );
  }

  const center = toLatLngLiteral(sourceLocation!);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border px-4 py-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1">
            <p className="text-text-secondary">Source Hospital</p>
            <p className="font-medium text-text-primary">{sourceName}</p>
          </div>
          <Navigation className="h-4 w-4 shrink-0 rotate-90 text-primary" />
          <div className="flex-1 text-right">
            <p className="text-text-secondary">Destination Hospital</p>
            <p className="font-medium text-text-primary">{destinationName}</p>
          </div>
        </div>
      </div>

      <LeafletMapContainer center={center} zoom={8} className={className}>
        <FitRouteBounds path={path} />
        <Marker
          position={[sourceLocation!.latitude, sourceLocation!.longitude]}
          icon={createLabelIcon("A")}
        >
          <Popup>{sourceName}</Popup>
        </Marker>
        <Marker
          position={[
            destinationLocation!.latitude,
            destinationLocation!.longitude,
          ]}
          icon={createLabelIcon("B")}
        >
          <Popup>{destinationName}</Popup>
        </Marker>
        {path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{ color: "#2563EB", weight: 4, opacity: 0.9 }}
          />
        )}
      </LeafletMapContainer>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border px-4 py-3 text-sm">
        {isLoadingRoute ? (
          <div className="col-span-2 flex items-center gap-2 text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Calculating route...
          </div>
        ) : routeError ? (
          <div className="col-span-2 text-danger">{routeError}</div>
        ) : route ? (
          <>
            <div>
              <p className="text-text-secondary">Distance</p>
              <p className="font-medium text-text-primary">{route.distanceText}</p>
            </div>
            <div>
              <p className="text-text-secondary">Estimated Travel Time</p>
              <p className="font-medium text-text-primary">{route.durationText}</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
