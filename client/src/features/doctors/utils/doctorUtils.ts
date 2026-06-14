import type {
  CreateDoctorPayload,
  Doctor,
  DoctorFilters,
  DoctorFormValues,
} from "@/features/doctors/types/doctor.types";

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

export function toDoctorFormValues(doctor?: Doctor): DoctorFormValues {
  if (!doctor) {
    return {
      name: "",
      email: "",
      specialization: "",
      experience: "",
      hospital: "",
      status: "AVAILABLE",
    };
  }

  return {
    name: doctor.name,
    email: doctor.email || "",
    specialization: doctor.specialization,
    experience: doctor.experience != null ? String(doctor.experience) : "",
    hospital:
      typeof doctor.hospital === "string"
        ? doctor.hospital
        : doctor.hospital._id,
    status: doctor.status,
  };
}

export function validateDoctorForm(values: DoctorFormValues): string | null {
  if (!values.name.trim()) return "Name is required";
  if (!values.specialization.trim()) return "Specialization is required";
  if (!values.hospital) return "Hospital is required";
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return "Enter a valid email address";
  }
  return null;
}

export function toCreateDoctorPayload(
  values: DoctorFormValues,
): CreateDoctorPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim() || undefined,
    specialization: values.specialization.trim(),
    experience: values.experience ? Number(values.experience) : undefined,
    hospital: values.hospital,
    status: values.status,
  };
}
