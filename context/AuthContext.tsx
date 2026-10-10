"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { watchAuth, watchProfile } from "@/lib/firebase-actions";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  /** True until both the auth state and the profile document have loaded. */
  loading: boolean;
  /** False until the Firebase keys are set in .env.local. */
  configured: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, profile: null, loading: true, configured: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "configured">>({ user: null, profile: null, loading: isFirebaseConfigured });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = watchAuth((user) => {
      unsubProfile?.();
      if (!user) return setState({ user: null, profile: null, loading: false });
      setState((s) => ({ ...s, user, loading: true }));
      unsubProfile = watchProfile(user.uid, (profile) => setState({ user, profile, loading: false }));
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
  }, []);

  return <AuthContext.Provider value={{ ...state, configured: isFirebaseConfigured }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
