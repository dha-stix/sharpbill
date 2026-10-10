"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ConfigNotice } from "@/components/auth/AuthShared";
import { PageLoader } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

/** Authenticated layout: guards the route, renders the sidebar and a mobile drawer. */
export default function AppShell({ children }: { children: ReactNode }) {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!configured || loading) return;
    if (!user) router.replace("/auth/login");
    else if (profile && !profile.setupComplete) router.replace("/auth/business-setup");
  }, [configured, loading, user, profile, router]);

  if (loading) return <PageLoader label="Loading your workspace" />;

  if (!configured)
    return (
      <div className="mx-auto grid min-h-screen max-w-lg place-items-center p-6">
        <div className="flex flex-col gap-4 text-center">
          <Logo className="self-center" />
          <ConfigNotice />
        </div>
      </div>
    );

  if (!user || !profile?.setupComplete) return <PageLoader label="Loading your workspace" />;

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 lg:block">
        <Sidebar />
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo variant="light" href="/dashboard" size="sm" />
        <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className="grid size-11 place-items-center rounded-xl text-white hover:bg-ink-2">
          <Icon name="menu" size={22} />
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-50 bg-ink/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)}>
            <motion.div
              className="h-full w-[280px] max-w-[85vw]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
    </div>
  );
}
