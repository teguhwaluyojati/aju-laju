import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  Vehicle,
  ServiceRecord,
  FuelRecord,
  VehicleInput,
  ServiceRecordInput,
  FuelRecordInput,
} from "../types";

// Helper to convert Firestore Timestamp to Date
const convertTimestamp = (data: DocumentData) => {
  const result = { ...data };
  if (result.createdAt?.toDate) result.createdAt = result.createdAt.toDate();
  if (result.updatedAt?.toDate) result.updatedAt = result.updatedAt.toDate();
  return result;
};

// ==================== USER PROFILE ====================

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  // Only create if doesn't exist
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      photoURL: photoURL || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;
  return convertTimestamp(userSnap.data()) as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// ==================== VEHICLES ====================

export async function getVehicles(userId: string): Promise<Vehicle[]> {
  if (!db) throw new Error("Firestore not initialized");

  const q = query(
    collection(db, "vehicles"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as Vehicle[];
}

export async function getVehicle(vehicleId: string): Promise<Vehicle | null> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "vehicles", vehicleId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...convertTimestamp(docSnap.data()) } as Vehicle;
}

export async function createVehicle(userId: string, data: VehicleInput): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, "vehicles"), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateVehicle(
  vehicleId: string,
  data: Partial<VehicleInput>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "vehicles", vehicleId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, "vehicles", vehicleId));
}

// ==================== SERVICE RECORDS ====================

export async function getServiceRecords(userId: string, vehicleId?: string): Promise<ServiceRecord[]> {
  if (!db) throw new Error("Firestore not initialized");

  let q;
  if (vehicleId) {
    q = query(
      collection(db, "services"),
      where("userId", "==", userId),
      where("vehicleId", "==", vehicleId),
      orderBy("date", "desc")
    );
  } else {
    q = query(
      collection(db, "services"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
  }
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as ServiceRecord[];
}

export async function createServiceRecord(
  userId: string,
  data: ServiceRecordInput
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, "services"), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Update vehicle's lastServiceOdometer and odometer if provided
  if (data.vehicleId && data.odometer && data.odometer > 0) {
    const vehicle = await getVehicle(data.vehicleId);
    if (vehicle) {
      const updateData: { lastServiceOdometer: number; odometer?: number; updatedAt: ReturnType<typeof Timestamp.now> } = {
        lastServiceOdometer: data.odometer,
        updatedAt: Timestamp.now(),
      };

      // Also update vehicle odometer if higher
      if (data.odometer > (vehicle.odometer || 0)) {
        updateData.odometer = data.odometer;
      }

      await updateVehicle(data.vehicleId, updateData);
    }
  }

  return docRef.id;
}

export async function updateServiceRecord(
  recordId: string,
  data: Partial<ServiceRecordInput>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "services", recordId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteServiceRecord(recordId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, "services", recordId));
}

// ==================== FUEL RECORDS ====================

export async function getFuelRecords(userId: string, vehicleId?: string): Promise<FuelRecord[]> {
  if (!db) throw new Error("Firestore not initialized");

  let q;
  if (vehicleId) {
    q = query(
      collection(db, "fuels"),
      where("userId", "==", userId),
      where("vehicleId", "==", vehicleId),
      orderBy("date", "desc")
    );
  } else {
    q = query(
      collection(db, "fuels"),
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
  }
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamp(doc.data()),
  })) as FuelRecord[];
}

export async function createFuelRecord(
  userId: string,
  data: FuelRecordInput
): Promise<string> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await addDoc(collection(db, "fuels"), {
    ...data,
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Update vehicle odometer and fuel consumption if new odometer is higher
  if (data.vehicleId && data.odometer > 0) {
    const vehicle = await getVehicle(data.vehicleId);
    if (vehicle && data.odometer > (vehicle.odometer || 0)) {
      const updateData: { odometer: number; fuelConsumption?: number; updatedAt: ReturnType<typeof Timestamp.now> } = {
        odometer: data.odometer,
        updatedAt: Timestamp.now(),
      };

      // Calculate fuel consumption (km/L) if we have previous odometer data
      if (vehicle.odometer && vehicle.odometer > 0 && data.liter > 0) {
        const distanceTraveled = data.odometer - vehicle.odometer;
        if (distanceTraveled > 0) {
          const newConsumption = distanceTraveled / data.liter;
          // Average with existing consumption for smoother calculation
          if (vehicle.fuelConsumption && vehicle.fuelConsumption > 0) {
            updateData.fuelConsumption = Math.round(((vehicle.fuelConsumption + newConsumption) / 2) * 10) / 10;
          } else {
            updateData.fuelConsumption = Math.round(newConsumption * 10) / 10;
          }
        }
      }

      await updateVehicle(data.vehicleId, updateData);
    }
  }

  return docRef.id;
}

export async function updateFuelRecord(
  recordId: string,
  data: Partial<FuelRecordInput>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = doc(db, "fuels", recordId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteFuelRecord(recordId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");

  await deleteDoc(doc(db, "fuels", recordId));
}

// ==================== STATISTICS ====================

export async function getUserStats(userId: string) {
  const [vehicles, services, fuels] = await Promise.all([
    getVehicles(userId),
    getServiceRecords(userId),
    getFuelRecords(userId),
  ]);

  const totalServiceCost = services.reduce((sum, s) => sum + s.cost, 0);
  const totalFuelCost = fuels.reduce((sum, f) => sum + f.cost, 0);
  const totalFuelLiter = fuels.reduce((sum, f) => sum + f.liter, 0);

  return {
    vehicleCount: vehicles.length,
    serviceCount: services.length,
    fuelCount: fuels.length,
    totalServiceCost,
    totalFuelCost,
    totalFuelLiter,
    totalCost: totalServiceCost + totalFuelCost,
  };
}

// ==================== SERVICE REMINDERS ====================

export interface ServiceReminder {
  vehicle: Vehicle;
  nextServiceAt: number; // KM where next service is due
  kmRemaining: number; // KM remaining until next service
  isUrgent: boolean; // true if within 500 KM
}

export async function getServiceReminders(userId: string): Promise<ServiceReminder[]> {
  const vehicles = await getVehicles(userId);
  const reminders: ServiceReminder[] = [];

  for (const vehicle of vehicles) {
    // Skip if no service interval set
    if (!vehicle.serviceInterval || vehicle.serviceInterval <= 0) continue;

    const lastService = vehicle.lastServiceOdometer || 0;
    const currentOdometer = vehicle.odometer || 0;
    const nextServiceAt = lastService + vehicle.serviceInterval;
    const kmRemaining = nextServiceAt - currentOdometer;

    // Only include if within 500 KM or past due
    if (kmRemaining <= 500) {
      reminders.push({
        vehicle,
        nextServiceAt,
        kmRemaining,
        isUrgent: kmRemaining <= 500,
      });
    }
  }

  // Sort by most urgent first
  return reminders.sort((a, b) => a.kmRemaining - b.kmRemaining);
}
