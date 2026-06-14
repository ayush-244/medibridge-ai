import { MapContainer, TileLayer } from "react-leaflet";
import { cn } from "@/lib/utils";

interface LeafletMapContainerProps {
  center: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
}

export function LeafletMapContainer({
  center,
  zoom = 10,
  className,
  children,
}: LeafletMapContainerProps) {
  return (
    <div className={cn("relative h-full min-h-[280px] w-full", className)}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="z-0 h-full w-full rounded-lg"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
}
