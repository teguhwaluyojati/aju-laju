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
import { getFuelConsumptionStats } from "../utils/fuelConsumption";
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

  if (data.vehicleId && data.odometer && data.odometer > 0) {
    const vehicle = await getVehicle(data.vehicleId);
    if (vehicle) {
      const updateData: {
        lastServiceOdometer: number;
        serviceInterval?: number;
        odometer?: number;
        updatedAt: ReturnType<typeof Timestamp.now>;
      } = {
        lastServiceOdometer: data.odometer,
        updatedAt: Timestamp.now(),
      };

      if (typeof data.intervalKm === "number" && data.intervalKm > 0) {
        updateData.serviceInterval = data.intervalKm;
      }

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
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const existing = snapshot.data() as Partial<ServiceRecord>;
    const nextVehicleId = data.vehicleId || existing.vehicleId;
    const nextOdometer = typeof data.odometer === "number" ? data.odometer : existing.odometer;
    const nextIntervalKm = typeof data.intervalKm === "number" ? data.intervalKm : existing.intervalKm;

    if (nextVehicleId && typeof nextOdometer === "number" && nextOdometer > 0) {
      const vehicle = await getVehicle(nextVehicleId);
      if (vehicle) {
        const updateData: Partial<VehicleInput> = {
          lastServiceOdometer: nextOdometer,
        };

        if (typeof nextIntervalKm === "number" && nextIntervalKm > 0) {
          updateData.serviceInterval = nextIntervalKm;
        }

        if (nextOdometer > (vehicle.odometer || 0)) {
          updateData.odometer = nextOdometer;
        }

        await updateVehicle(nextVehicleId, updateData);
      }
    }
  }

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

  if (data.vehicleId && data.odometer > 0) {
    const vehicle = await getVehicle(data.vehicleId);
    const vehicleFuelRecords = await getFuelRecords(userId, data.vehicleId);
    const consumptionStats = getFuelConsumptionStats(vehicleFuelRecords, 500);

    if (vehicle && data.odometer > (vehicle.odometer || 0)) {
      const updateData: { odometer: number; fuelConsumption?: number; updatedAt: ReturnType<typeof Timestamp.now> } = {
        odometer: data.odometer,
        updatedAt: Timestamp.now(),
      };

      if (consumptionStats.averageByDistanceWindow !== null) {
        updateData.fuelConsumption = consumptionStats.averageByDistanceWindow;
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

export function buildVehicleServiceReminder(
  vehicle: Vehicle,
  serviceRows: ServiceRecord[]
): ServiceReminder | null {
  const latestService = [...serviceRows]
    .filter((row) => row.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (!latestService) return null;

  const lastServiceOdometer =
    typeof latestService.odometer === "number" && latestService.odometer > 0
      ? latestService.odometer
      : vehicle.lastServiceOdometer || 0;

  const serviceInterval =
    typeof latestService.intervalKm === "number" && latestService.intervalKm > 0
      ? latestService.intervalKm
      : vehicle.serviceInterval || 0;

  if (!serviceInterval || serviceInterval <= 0 || !lastServiceOdometer || lastServiceOdometer <= 0) {
    return null;
  }

  const currentOdometer = vehicle.odometer || 0;
  const nextServiceAt = lastServiceOdometer + serviceInterval;
  const kmRemaining = nextServiceAt - currentOdometer;

  return {
    vehicle,
    nextServiceAt,
    kmRemaining,
    isUrgent: kmRemaining <= 500,
  };
}

export async function getServiceReminders(userId: string): Promise<ServiceReminder[]> {
  const [vehicles, serviceRows] = await Promise.all([getVehicles(userId), getServiceRecords(userId)]);
  const reminders: ServiceReminder[] = [];

  for (const vehicle of vehicles) {
    const reminder = buildVehicleServiceReminder(vehicle, serviceRows);
    if (!reminder) continue;

    if (reminder.kmRemaining <= 500) {
      reminders.push(reminder);
    }
  }

  return reminders.sort((a, b) => a.kmRemaining - b.kmRemaining);
}
