import { useMemo } from "react";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { hasHospitalCoordinates } from "@/features/hospitals/utils/hospitalUtils";
import type {
  HospitalMapMarkerData,
  MapAnalyticsData,
} from "@/features/maps/types/maps.types";

export function useHospitalMapData(
  hospitals: Hospital[],
  doctors: Doctor[],
): {
  markers: HospitalMapMarkerData[];
  analytics: MapAnalyticsData;
  hospitalsWithCoordinates: Hospital[];
  hospitalsMissingCoordinates: Hospital[];
} {
  return useMemo(() => {
    const doctorsByHospital = doctors.reduce<
      Record<string, { count: number; specializations: Set<string> }>
    >((acc, doctor) => {
      const hospitalId =
        typeof doctor.hospital === "string"
          ? doctor.hospital
          : doctor.hospital._id;

      if (!acc[hospitalId]) {
        acc[hospitalId] = { count: 0, specializations: new Set() };
      }

      if (doctor.status === "AVAILABLE") {
        acc[hospitalId].count += 1;
      }
      acc[hospitalId].specializations.add(doctor.specialization);
      return acc;
    }, {});

    const hospitalsWithCoordinates = hospitals.filter(hasHospitalCoordinates);
    const hospitalsMissingCoordinates = hospitals.filter(
      (hospital) => !hasHospitalCoordinates(hospital),
    );

    const markers: HospitalMapMarkerData[] = hospitalsWithCoordinates.map(
      (hospital) => {
        const doctorInfo = doctorsByHospital[hospital._id] || {
          count: 0,
          specializations: new Set<string>(),
        };

        return {
          id: hospital._id,
          name: hospital.name,
          city: hospital.city,
          state: hospital.state,
          logo: hospital.logo,
          availableBeds: hospital.availableBeds,
          availableDoctors: doctorInfo.count,
          specializations: Array.from(doctorInfo.specializations),
          location: hospital.location!,
        };
      },
    );

    const regionCounts = hospitals.reduce<Record<string, number>>(
      (acc, hospital) => {
        const key = hospital.state || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    const cityCounts = hospitals.reduce<Record<string, number>>(
      (acc, hospital) => {
        const key = hospital.city || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {},
    );

    const bedCapacityCounts = hospitals.reduce<Record<string, number>>(
      (acc, hospital) => {
        let bucket = "0 beds";
        if (hospital.totalBeds >= 100) bucket = "100+ beds";
        else if (hospital.totalBeds >= 50) bucket = "50–99 beds";
        else if (hospital.totalBeds >= 20) bucket = "20–49 beds";
        else if (hospital.totalBeds > 0) bucket = "1–19 beds";

        acc[bucket] = (acc[bucket] || 0) + 1;
        return acc;
      },
      {},
    );

    const analytics: MapAnalyticsData = {
      hospitalsByRegion: Object.entries(regionCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      geographicDistribution: Object.entries(cityCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      bedCapacityDistribution: Object.entries(bedCapacityCounts).map(
        ([name, value]) => ({ name, value }),
      ),
    };

    return {
      markers,
      analytics,
      hospitalsWithCoordinates,
      hospitalsMissingCoordinates,
    };
  }, [hospitals, doctors]);
}
