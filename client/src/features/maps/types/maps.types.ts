import type { HospitalLocation } from "@/features/hospitals/types/hospital.types";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  polyline: LatLngLiteral[];
}

export interface DistanceResult {
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
}

export type DestinationSortMode = "nearest" | "most_beds" | "same_specialty";

export interface HospitalMapMarkerData {
  id: string;
  name: string;
  city: string;
  state: string;
  logo?: string | null;
  availableBeds: number;
  availableDoctors: number;
  specializations: string[];
  location: HospitalLocation;
}

export interface MapAnalyticsData {
  hospitalsByRegion: { name: string; value: number }[];
  geographicDistribution: { name: string; value: number }[];
  bedCapacityDistribution: { name: string; value: number }[];
}
