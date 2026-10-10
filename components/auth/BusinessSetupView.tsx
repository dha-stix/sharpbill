"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { StorefrontIllustration } from "@/components/illustrations/AuthIllustrations";
import BusinessFields from "@/components/settings/BusinessFields";
import { Avatar, PageLoader, Spinner } from "@/components/ui/Bits";
import Logo from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { EMPTY_BUSINESS } from "@/lib/constants";
import { saveBusinessProfile } from "@/lib/firebase-actions";
import { addressLines, currencySymbol } from "@/lib/format";
import type { BusinessProfile } from "@/lib/types";

export default function BusinessSetupView() {
  const { user, profile, loading, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/auth/login");
  }, [configured, loading, user, router]);

  if (configured && (loading || !user || !profile)) return <PageLoader label="Preparing your workspace" />;
  return <SetupForm initial={profile?.business} configured={configured} />;
}

function SetupForm({ initial, configured }: { initial?: BusinessProfile; configured: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [biz, setBiz] = useState<BusinessProfile>(() => ({ ...EMPTY_BUSINESS, ...initial, address: { ...EMPTY_BUSINESS.address, ...initial?.address } }));
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!biz.name.trim()) return toast("Add your business name.", "error");
    setBusy(true);
    try {
      await saveBusinessProfile(biz, true);
      toast("You’re all set!");
      router.replace("/dashboard");
    } catch (err) {
      toast((err as Error).message, "error");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3 text-sm text-muted">
          Step 2 of 2
          <span className="block h-1.5 w-28 overflow-hidden rounded bg-line-2">
            <motion.span className="block h-full bg-ink" initial={{ width: "50%" }} animate={{ width: "100%" }} transition={{ duration: 0.9, delay: 0.3 }} />
          </span>
        </div>
      </header>

      <form onSubmit={onSubmit} className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-10 px-4 pb-16 pt-4 sm:px-6">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex min-w-0 flex-[999_1_560px] flex-col gap-7">
          <div>
            <h1 className="font-display text-[clamp(2.1rem,4vw,3rem)] font-extrabold tracking-[-0.03em]">Tell us about your business</h1>
            <p className="mt-2 text-[17px] text-muted">This appears on every invoice you send. You can change it later in Settings.</p>
          </div>
          <div className="card p-5 sm:p-7">
            <BusinessFields value={biz} onChange={setBiz} />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button type="submit" disabled={busy || !configured} className="btn btn-lime !min-h-[52px] !px-7">
              {busy && <Spinner />} Finish setup &amp; open dashboard
            </button>
          </div>
        </motion.section>

        <motion.aside initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-[22px] bg-ink px-5 pt-5">
            <StorefrontIllustration />
          </div>
          <div className="eyebrow">Live preview</div>
          <motion.div layout className="card p-7 shadow-float">
            <div className="flex items-start justify-between gap-3">
              <Avatar name={biz.name || "Your Business"} src={biz.logo} size={52} className="!rounded-2xl !bg-ink !text-lime" />
              <div className="text-right">
                <div className="font-display text-2xl font-bold">Invoice</div>
                <div className="font-mono text-sm text-muted">INV-001</div>
              </div>
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div key={biz.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 font-semibold">
                {biz.name || "Your business name"}
              </motion.div>
            </AnimatePresence>
            <div className="text-sm leading-relaxed text-muted">
              {addressLines(biz.address).map((l) => <div key={l}>{l}</div>)}
              {biz.email && <div>{biz.email}</div>}
            </div>
            <div className="mt-5 space-y-2.5">
              {[100, 80, 60].map((w) => <span key={w} className="block h-2 rounded bg-[#EDEDE6]" style={{ width: `${w}%` }} />)}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-line-2 pt-3.5">
              <span className="text-sm text-muted">Currency</span>
              <span className="font-mono font-medium">{biz.currency} {currencySymbol(biz.currency)}</span>
            </div>
          </motion.div>
        </motion.aside>
      </form>
    </div>
  );
}
