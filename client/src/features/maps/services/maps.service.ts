import { OPENROUTESERVICE_API_KEY } from "@/lib/constants";
import type {
  DistanceResult,
  LatLng,
  RouteResult,
} from "@/features/maps/types/maps.types";
import {
  formatDistance,
  formatDuration,
  haversineDistance,
  toLatLngLiteral,
} from "@/features/maps/utils/geoUtils";

const ORS_BASE_URL = "https://api.openrouteservice.org/v2";

export function isOpenRouteServiceConfigured(): boolean {
  return Boolean(OPENROUTESERVICE_API_KEY);
}

function haversineDistanceResult(
  origin: LatLng,
  destination: LatLng,
): DistanceResult {
  const straightLineKm = haversineDistance(origin, destination);
  const estimatedSeconds = Math.round((straightLineKm / 40) * 3600);

  return {
    distanceText: formatDistance(straightLineKm),
    distanceMeters: Math.round(straightLineKm * 1000),
    durationText: formatDuration(estimatedSeconds),
    durationSeconds: estimatedSeconds,
  };
}

function haversineRouteResult(origin: LatLng, destination: LatLng): RouteResult {
  const fallback = haversineDistanceResult(origin, destination);

  return {
    ...fallback,
    polyline: [toLatLngLiteral(origin), toLatLngLiteral(destination)],
  };
}

export function calculateDistance(
  origin: LatLng,
  destination: LatLng,
): number {
  return haversineDistance(origin, destination);
}

export async function calculateETA(
  origin: LatLng,
  destination: LatLng,
): Promise<DistanceResult> {
  if (!isOpenRouteServiceConfigured()) {
    return haversineDistanceResult(origin, destination);
  }

  try {
    const response = await fetch(`${ORS_BASE_URL}/matrix/driving-car`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: OPENROUTESERVICE_API_KEY,
      },
      body: JSON.stringify({
        locations: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
        sources: [0],
        destinations: [1],
      }),
    });

    if (response.status === 429) {
      throw new Error("OpenRouteService rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`OpenRouteService matrix failed: ${response.status}`);
    }

    const data = await response.json();
    const distanceMeters = data.distances?.[0]?.[1];
    const durationSeconds = data.durations?.[0]?.[1];

    if (distanceMeters == null || durationSeconds == null) {
      throw new Error("Invalid OpenRouteService matrix response");
    }

    return {
      distanceText: formatDistance(distanceMeters / 1000),
      distanceMeters: Math.round(distanceMeters),
      durationText: formatDuration(durationSeconds),
      durationSeconds: Math.round(durationSeconds),
    };
  } catch {
    return haversineDistanceResult(origin, destination);
  }
}

export async function getRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<RouteResult> {
  if (!isOpenRouteServiceConfigured()) {
    return haversineRouteResult(origin, destination);
  }

  try {
    const start = `${origin.longitude},${origin.latitude}`;
    const end = `${destination.longitude},${destination.latitude}`;
    const url = `${ORS_BASE_URL}/directions/driving-car?start=${start}&end=${end}`;

    const response = await fetch(url, {
      headers: {
        Authorization: OPENROUTESERVICE_API_KEY,
      },
    });

    if (response.status === 429) {
      throw new Error("OpenRouteService rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`OpenRouteService directions failed: ${response.status}`);
    }

    const data = await response.json();
    const feature = data.features?.[0];

    if (!feature?.properties?.summary) {
      throw new Error("No route found");
    }

    const summary = feature.properties.summary;
    const coordinates = feature.geometry?.coordinates as
      | [number, number][]
      | undefined;

    const polyline =
      coordinates?.map(([lng, lat]) => ({ lat, lng })) ?? [
        toLatLngLiteral(origin),
        toLatLngLiteral(destination),
      ];

    return {
      distanceText: formatDistance(summary.distance / 1000),
      distanceMeters: Math.round(summary.distance),
      durationText: formatDuration(summary.duration),
      durationSeconds: Math.round(summary.duration),
      polyline,
    };
  } catch {
    return haversineRouteResult(origin, destination);
  }
}
