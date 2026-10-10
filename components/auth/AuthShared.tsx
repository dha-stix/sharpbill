"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { GoogleIcon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Bits";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { authErrorMessage, signInWithGoogle } from "@/lib/firebase-actions";
import type { UserProfile } from "@/lib/types";

export const nextRoute = (p: UserProfile | null) => (p?.setupComplete ? "/dashboard" : "/auth/business-setup");

/** Sends signed-in visitors away from login/register to where they belong. */
export function useRedirectIfSignedIn() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user && profile) router.replace(nextRoute(profile));
  }, [loading, user, profile, router]);
}

export function GoogleButton({ label }: { label: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const router = useRouter();
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, boxShadow: "0 12px 24px -14px rgba(14,17,22,.4)" }}
      whileTap={{ scale: 0.98 }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const profile = await signInWithGoogle();
          router.replace(nextRoute(profile));
        } catch (e) {
          toast(authErrorMessage(e), "error");
          setBusy(false);
        }
      }}
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-line-2 bg-white font-semibold"
    >
      {busy ? <Spinner /> : <GoogleIcon />}
      {label}
    </motion.button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-[#8A8F9C]">
      <span className="h-px flex-1 bg-line-2" />
      {label}
      <span className="h-px flex-1 bg-line-2" />
    </div>
  );
}

export function ConfigNotice() {
  const { configured } = useAuth();
  if (configured) return null;
  return (
    <div role="status" className="rounded-2xl border border-[#F0D58C] bg-[#FFF8E1] p-4 text-sm text-[#6B5200]">
      <strong>Firebase isn’t connected yet.</strong> Add your keys to <code className="font-mono">.env.local</code> (see <code className="font-mono">.env.example</code>) to enable sign-in.
    </div>
  );
}

/** Staggered entrance for auth form children. */
export function AuthStagger({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="flex w-full max-w-[420px] flex-col gap-6"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

export function AuthItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] } } }}>
      {children}
    </motion.div>
  );
}
