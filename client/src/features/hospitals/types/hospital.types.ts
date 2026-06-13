export interface HospitalLocation {
  latitude?: number;
  longitude?: number;
}

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  totalBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
  location?: HospitalLocation;
  doctors: string[];
  createdAt?: string;
  updatedAt?: string;
}
