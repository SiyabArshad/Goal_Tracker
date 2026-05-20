"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { GUEST_USER_ID } from "@/lib/storage/constants";
import {
  disableGuestMode,
  enableGuestMode,
  isGuestModeEnabled,
} from "@/lib/storage/guestMode";
import { signOutUser } from "@/services/authService";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  /** Use for all data reads/writes (Firebase uid or guest id). */
  userId: string | null;
  enterGuestMode: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isGuest: false,
  userId: null,
  enterGuestMode: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(
    () => typeof window !== "undefined" && isGuestModeEnabled()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        disableGuestMode();
        setIsGuest(false);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsGuest(isGuestModeEnabled());
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const enterGuestMode = useCallback(async () => {
    if (auth.currentUser) {
      await signOutUser();
    }
    enableGuestMode();
    setIsGuest(true);
    setUser(null);
  }, []);

  const signOut = useCallback(async () => {
    if (isGuest) {
      disableGuestMode();
      setIsGuest(false);
      return;
    }
    await signOutUser();
    disableGuestMode();
    setIsGuest(false);
  }, [isGuest]);

  const userId = user?.uid ?? (isGuest ? GUEST_USER_ID : null);

  return (
    <AuthContext.Provider
      value={{ user, loading, isGuest, userId, enterGuestMode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

