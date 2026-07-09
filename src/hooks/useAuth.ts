"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile } from "../lib/firestore";

const SESSION_MAX_MS = 6 * 60 * 60 * 1000; // 6 hours
const SESSION_STARTED_AT_KEY = "ajulaju.session.startedAt";

function getSessionStartedAt(): number | null {
  const value = window.localStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!value) return null;

  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function setSessionStartedAt(timestamp: number) {
  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(timestamp));
}

function clearSessionStartedAt() {
  window.localStorage.removeItem(SESSION_STARTED_AT_KEY);
}

function getLastSignInTimestamp(user: User): number {
  const lastSignIn = user.metadata?.lastSignInTime;
  if (!lastSignIn) return Date.now();

  const parsed = new Date(lastSignIn).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function isSessionExpired(): boolean {
  const startedAt = getSessionStartedAt();
  if (!startedAt) return false;
  return Date.now() - startedAt > SESSION_MAX_MS;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        clearSessionStartedAt();
        setUser(null);
        setLoading(false);
        return;
      }

      // Track session start from the latest successful sign-in.
      setSessionStartedAt(getLastSignInTimestamp(user));

      if (isSessionExpired()) {
        await signOut(auth);
        clearSessionStartedAt();
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);

      // Create user profile in Firestore on first login
      if (user) {
        try {
          await createUserProfile(
            user.uid,
            user.email || "",
            user.displayName || user.email?.split("@")[0] || "User",
            user.photoURL || undefined
          );
        } catch (error) {
          console.error("Error creating user profile:", error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth || !user) return;

    const intervalId = window.setInterval(async () => {
      if (isSessionExpired()) {
        try {
          await signOut(auth);
        } finally {
          clearSessionStartedAt();
          setUser(null);
        }
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [user]);

  return { user, loading, isAuthenticated: !!user };
}
