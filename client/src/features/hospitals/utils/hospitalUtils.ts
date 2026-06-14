import type { HospitalCapacityStatus } from "@/lib/constants";
import { getEmailError, getPhoneError } from "@/lib/validation";
import type {
  CreateHospitalPayload,
  Hospital,
  HospitalFormValues,
} from "@/features/hospitals/types/hospital.types";

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

export function toHospitalFormValues(hospital?: Hospital): HospitalFormValues {
  if (!hospital) {
    return {
      name: "",
      address: "",
      city: "",
      state: "",
      contactNumber: "",
      email: "",
      logo: null,
      latitude: "",
      longitude: "",
      totalBeds: "",
      availableBeds: "",
      totalICUBeds: "",
      availableICUBeds: "",
    };
  }

  return {
    name: hospital.name,
    address: hospital.address,
    city: hospital.city,
    state: hospital.state,
    contactNumber: hospital.contactNumber || "",
    email: hospital.email || "",
    logo: hospital.logo ?? null,
    latitude:
      hospital.location?.latitude != null
        ? String(hospital.location.latitude)
        : "",
    longitude:
      hospital.location?.longitude != null
        ? String(hospital.location.longitude)
        : "",
    totalBeds: String(hospital.totalBeds),
    availableBeds: String(hospital.availableBeds),
    totalICUBeds: String(hospital.totalICUBeds),
    availableICUBeds: String(hospital.availableICUBeds),
  };
}

export function validateHospitalForm(values: HospitalFormValues): string | null {
  if (!values.name.trim()) return "Hospital name is required";
  if (!values.address.trim()) return "Address is required";
  if (!values.city.trim()) return "City is required";
  if (!values.state.trim()) return "State is required";

  const latitude = Number(values.latitude);
  const longitude = Number(values.longitude);

  if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
    return "Latitude must be a number between -90 and 90";
  }

  if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
    return "Longitude must be a number between -180 and 180";
  }

  const totalBeds = Number(values.totalBeds);
  const availableBeds = Number(values.availableBeds);
  const totalICUBeds = Number(values.totalICUBeds);
  const availableICUBeds = Number(values.availableICUBeds);

  if (Number.isNaN(totalBeds) || totalBeds < 0) return "Invalid total beds";
  if (Number.isNaN(availableBeds) || availableBeds < 0) {
    return "Invalid available beds";
  }
  if (availableBeds > totalBeds) {
    return "Available beds cannot exceed total beds";
  }
  if (Number.isNaN(totalICUBeds) || totalICUBeds < 0) {
    return "Invalid total ICU beds";
  }
  if (Number.isNaN(availableICUBeds) || availableICUBeds < 0) {
    return "Invalid available ICU beds";
  }
  if (availableICUBeds > totalICUBeds) {
    return "Available ICU beds cannot exceed total ICU beds";
  }

  if (values.email) {
    const emailError = getEmailError(values.email);
    if (emailError) return emailError;
  }

  if (values.contactNumber) {
    const phoneError = getPhoneError(values.contactNumber);
    if (phoneError) return phoneError;
  }

  return null;
}

export function toCreateHospitalPayload(
  values: HospitalFormValues,
): CreateHospitalPayload {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    contactNumber: values.contactNumber.trim() || undefined,
    email: values.email.trim() || undefined,
    logo: values.logo,
    totalBeds: Number(values.totalBeds),
    availableBeds: Number(values.availableBeds),
    totalICUBeds: Number(values.totalICUBeds),
    availableICUBeds: Number(values.availableICUBeds),
    location: {
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    },
  };
}

export function hasHospitalCoordinates(
  hospital: Pick<Hospital, "location">,
): boolean {
  return (
    hospital.location?.latitude != null &&
    hospital.location?.longitude != null
  );
}

export function getGoogleMapsUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
