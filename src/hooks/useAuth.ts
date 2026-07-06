"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { createUserProfile } from "../lib/firestore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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

  return { user, loading, isAuthenticated: !!user };
}
