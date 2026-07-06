import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Direct access to env vars (required for Next.js client-side)
const envValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

const missingEnvKeys: string[] = [];
if (!envValues.apiKey) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!envValues.authDomain) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!envValues.projectId) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
if (!envValues.storageBucket) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!envValues.messagingSenderId) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!envValues.appId) missingEnvKeys.push("NEXT_PUBLIC_FIREBASE_APP_ID");

export const isFirebaseConfigured = missingEnvKeys.length === 0;

export const firebaseConfigError = isFirebaseConfigured
  ? ""
  : `Konfigurasi Firebase belum lengkap. Isi variabel ini di .env.local: ${missingEnvKeys.join(", ")}`;

const firebaseConfig = {
  apiKey: envValues.apiKey,
  authDomain: envValues.authDomain,
  projectId: envValues.projectId,
  storageBucket: envValues.storageBucket,
  messagingSenderId: envValues.messagingSenderId,
  appId: envValues.appId,
};

let app: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Auth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
