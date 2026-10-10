"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LoginIllustration } from "@/components/illustrations/AuthIllustrations";
import { Input, Spinner } from "@/components/ui/Bits";
import Logo from "@/components/ui/Logo";
import { SplitText } from "@/components/ui/Motion";
import { useToast } from "@/components/ui/Toast";
import { authErrorMessage, loginWithEmail, resetPassword } from "@/lib/firebase-actions";
import { AuthItem, AuthStagger, ConfigNotice, Divider, GoogleButton, nextRoute, useRedirectIfSignedIn } from "./AuthShared";

export default function LoginView() {
  useRedirectIfSignedIn();
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const profile = await loginWithEmail(email, password);
      router.replace(nextRoute(profile));
    } catch (err) {
      toast(authErrorMessage(err), "error");
      setBusy(false);
    }
  }

  async function onForgot() {
    if (!email) return toast("Enter your email first, then tap “Forgot?”.", "info");
    try {
      await resetPassword(email);
      toast("Password reset email sent.");
    } catch (err) {
      toast(authErrorMessage(err), "error");
    }
  }

  return (
    <div className="flex min-h-screen bg-paper">
      {/* art panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
        <Logo variant="light" />
        <div className="relative h-[420px]">
          <LoginIllustration />
          <motion.div
            initial={{ opacity: 0, x: -30, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: -4, y: [0, -12, 0] }}
            transition={{ opacity: { delay: 0.6 }, x: { delay: 0.6 }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute left-[4%] top-2 w-[250px] rounded-[18px] bg-white p-5 text-ink shadow-[0_30px_60px_-30px_#000]"
          >
            <div className="font-mono text-xs text-muted">INV-031</div>
            <div className="mt-1.5 font-display text-[28px] font-bold">€1,250.00</div>
            <div className="mt-3 inline-block rounded-full bg-[#E2F3E8] px-2.5 py-1 text-xs font-semibold text-[#1F6B42]">Paid</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 5, y: [0, -10, 0] }}
            transition={{ opacity: { delay: 0.9 }, x: { delay: 0.9 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
            className="absolute right-[2%] top-[250px] w-[220px] rounded-[18px] bg-lime p-5 text-ink"
          >
            <div className="font-mono text-xs">INV-032 · Sent</div>
            <div className="mt-1.5 font-display text-[28px] font-bold">₦480,000</div>
            <div className="mt-3 text-[13px]">Due in 14 days</div>
          </motion.div>
        </div>
        <div>
          <h2 className="max-w-[460px] font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.03em]">
            <SplitText text="Your invoices, right where you left them." />
          </h2>
          <p className="mt-3.5 text-soft">Pick up exactly where you stopped.</p>
        </div>
      </div>

      {/* form */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <div className="mb-10 lg:hidden"><Logo /></div>
        <AuthStagger>
          <AuthItem>
            <h1 className="font-display text-[40px] font-extrabold tracking-[-0.03em]">Welcome back</h1>
            <p className="mt-2 text-muted">Log in to your SharpBill workspace.</p>
          </AuthItem>
          <AuthItem><ConfigNotice /></AuthItem>
          <AuthItem><GoogleButton label="Continue with Google" /></AuthItem>
          <AuthItem><Divider label="or use email" /></AuthItem>
          <AuthItem>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Input label="Email" type="email" required autoComplete="email" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="flex flex-col gap-1.5">
                <Input label="Password" type="password" required autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={onForgot} className="self-end text-sm text-muted hover:text-ink">Forgot password?</button>
              </div>
              <button type="submit" disabled={busy} className="btn btn-ink !min-h-[54px] rounded-2xl">
                {busy && <Spinner />} Log in
              </button>
            </form>
          </AuthItem>
          <AuthItem>
            <p className="text-center text-[15px] text-muted">
              New to SharpBill? <Link href="/auth/register" className="font-semibold text-ink underline-offset-4 hover:underline">Create an account</Link>
            </p>
          </AuthItem>
        </AuthStagger>
      </div>
    </div>
  );
}
