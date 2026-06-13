import type { HospitalCapacityStatus } from "@/lib/constants";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

export function getHospitalCapacityStatus(
  hospital: Hospital,
): HospitalCapacityStatus {
  if (hospital.availableBeds === 0 && hospital.availableICUBeds === 0) {
    return "at_capacity";
  }

  const generalRatio =
    hospital.totalBeds > 0
      ? hospital.availableBeds / hospital.totalBeds
      : 0;

  if (generalRatio < 0.2 && hospital.availableBeds < 5) {
    return "limited";
  }

  return "operational";
}

export function getBedOccupancyRate(hospital: Hospital): string {
  if (hospital.totalBeds === 0) return "0%";
  const occupied = hospital.totalBeds - hospital.availableBeds;
  return `${Math.round((occupied / hospital.totalBeds) * 100)}%`;
}

export function getIcuOccupancyRate(hospital: Hospital): string {
  if (hospital.totalICUBeds === 0) return "0%";
  const occupied = hospital.totalICUBeds - hospital.availableICUBeds;
  return `${Math.round((occupied / hospital.totalICUBeds) * 100)}%`;
}

export function filterHospitals(
  hospitals: Hospital[],
  search: string,
): Hospital[] {
  const query = search.trim().toLowerCase();
  if (!query) return hospitals;

  return hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(query) ||
      h.city.toLowerCase().includes(query) ||
      h.state.toLowerCase().includes(query),
  );
}
