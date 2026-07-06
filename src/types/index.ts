// User Profile
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle
export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  plateNumber: string;
  type: "car" | "motorcycle";
  brand: string;
  year: number;
  color: string;
  odometer: number;
  purchaseDate?: string;
  notes?: string;
  // Service reminder fields
  serviceInterval?: number; // KM interval for service reminder (e.g., 5000)
  lastServiceOdometer?: number; // Odometer at last service
  // Fuel consumption
  fuelConsumption?: number; // Average km/L
  createdAt: Date;
  updatedAt: Date;
}

// Service Record
export interface ServiceRecord {
  id: string;
  userId: string;
  vehicleId: string;
  title: string;
  description?: string;
  date: string;
  cost: number;
  location: string;
  odometer?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Fuel Record
export interface FuelRecord {
  id: string;
  userId: string;
  vehicleId: string;
  date: string;
  liter: number;
  cost: number;
  pricePerLiter: number;
  station: string;
  odometer: number;
  fuelType?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Form input types (without id, timestamps, userId)
export type VehicleInput = Omit<Vehicle, "id" | "userId" | "createdAt" | "updatedAt">;
export type ServiceRecordInput = Omit<ServiceRecord, "id" | "userId" | "createdAt" | "updatedAt">;
export type FuelRecordInput = Omit<FuelRecord, "id" | "userId" | "createdAt" | "updatedAt">;
