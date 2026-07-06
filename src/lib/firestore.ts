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
