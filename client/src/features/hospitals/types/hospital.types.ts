export interface HospitalLocation {
  latitude: number;
  longitude: number;
}

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber?: string;
  email?: string;
  totalBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
  location?: HospitalLocation;
  doctors: string[];
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHospitalPayload {
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber?: string;
  email?: string;
  logo?: string | null;
  totalBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
  location: HospitalLocation;
}

export interface UpdateHospitalPayload extends Partial<CreateHospitalPayload> {}

export interface NearbyHospital extends Hospital {
  distance: number;
  availableDoctors: number;
  specializations: string[];
}

export interface NearbyHospitalsQuery {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface UpdateBedsPayload {
  availableBeds: number;
  availableICUBeds: number;
}

export interface HospitalFormValues {
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber: string;
  email: string;
  logo: string | null;
  latitude: string;
  longitude: string;
  totalBeds: string;
  availableBeds: string;
  totalICUBeds: string;
  availableICUBeds: string;
}
