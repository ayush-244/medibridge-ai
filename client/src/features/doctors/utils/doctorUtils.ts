import type { Doctor, DoctorFilters } from "@/features/doctors/types/doctor.types";

export function getDoctorUtilization(doctor: Doctor): number {
  if (doctor.maxPatients === 0) return 0;
  return Math.round((doctor.currentPatients / doctor.maxPatients) * 100);
}

export function getDoctorHospitalName(doctor: Doctor): string {
  if (typeof doctor.hospital === "string") return "—";
  return doctor.hospital.name;
}

export function getDoctorHospitalCity(doctor: Doctor): string {
  if (typeof doctor.hospital === "string") return "";
  return doctor.hospital.city;
}

export function getUniqueSpecializations(doctors: Doctor[]): string[] {
  const specs = new Set(doctors.map((d) => d.specialization));
  return Array.from(specs).sort();
}

export function filterDoctors(
  doctors: Doctor[],
  filters: DoctorFilters,
): Doctor[] {
  const query = filters.search.trim().toLowerCase();

  return doctors.filter((doctor) => {
    if (filters.status !== "ALL" && doctor.status !== filters.status) {
      return false;
    }

    if (
      filters.specialization !== "ALL" &&
      doctor.specialization !== filters.specialization
    ) {
      return false;
    }

    if (!query) return true;

    const hospitalName = getDoctorHospitalName(doctor).toLowerCase();

    return (
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      hospitalName.includes(query)
    );
  });
}
