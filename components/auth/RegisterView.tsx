"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { RegisterIllustration } from "@/components/illustrations/AuthIllustrations";
import { Icon } from "@/components/ui/Icon";
import { Input, Spinner } from "@/components/ui/Bits";
import Logo from "@/components/ui/Logo";
import { useToast } from "@/components/ui/Toast";
import { authErrorMessage, registerWithEmail } from "@/lib/firebase-actions";
import { AuthItem, AuthStagger, ConfigNotice, Divider, GoogleButton, useRedirectIfSignedIn } from "./AuthShared";

const PERKS = ["8 invoice designs, any currency", "Email invoices with the PDF attached", "Client records with full invoice history", "Automatic INV-001 numbering"];

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return s;
}
const STRENGTH = ["Too short", "Weak", "Okay", "Good", "Strong"];

export default function RegisterView() {
  useRedirectIfSignedIn();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const score = strength(form.password);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) return toast("Use at least 8 characters for your password.", "error");
    setBusy(true);
    try {
      await registerWithEmail(form.username.trim(), form.email.trim(), form.password);
      router.replace("/auth/business-setup");
    } catch (err) {
      toast(authErrorMessage(err), "error");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-row-reverse overflow-x-clip bg-paper lg:items-start">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
        className="sticky top-4 m-4 hidden h-[calc(100vh-2rem)] min-h-0 min-w-0 flex-[1_1_46%] flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-lime p-10 lg:flex xl:p-12"
      >
        <div className="self-end"><Logo /></div>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <RegisterIllustration />
        </div>
        <div>
          <h2 className="mb-6 font-display text-[clamp(2rem,3.4vw,3.1rem)] font-extrabold leading-[0.98] tracking-[-0.035em]">Start billing like a pro in minutes.</h2>
          <ul className="flex flex-col gap-3 text-base xl:text-[17px]">
            {PERKS.map((p, i) => (
              <motion.li key={p} className="flex items-center gap-3" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.12 }}>
                <span className="grid size-7 place-items-center rounded-full bg-ink text-lime"><Icon name="check" size={14} strokeWidth={3} /></span>
                {p}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <div className="flex min-h-screen min-w-0 flex-[1_1_54%] flex-col items-center justify-center px-5 py-12">
        <div className="mb-10 lg:hidden"><Logo /></div>
        <AuthStagger>
          <AuthItem>
            <span className="eyebrow">Step 1 of 2</span>
            <h1 className="mt-2 font-display text-[40px] font-extrabold tracking-[-0.03em]">Create your account</h1>
          </AuthItem>
          <AuthItem><ConfigNotice /></AuthItem>
          <AuthItem><GoogleButton label="Sign up with Google" /></AuthItem>
          <AuthItem><Divider label="or" /></AuthItem>
          <AuthItem>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Input label="Username" required autoComplete="username" placeholder="studioade" value={form.username} onChange={set("username")} />
              <Input label="Email" type="email" required autoComplete="email" placeholder="you@studio.com" value={form.email} onChange={set("email")} />
              <Input label="Password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={set("password")} />
              <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-[5px] flex-1 overflow-hidden rounded bg-line-2">
                      <motion.span className="block h-full bg-lime-deep" initial={false} animate={{ width: score >= i ? "100%" : "0%" }} transition={{ duration: 0.3 }} />
                    </span>
                  ))}
                </div>
                <span className="w-16 text-right text-xs text-muted">{form.password ? STRENGTH[score] : ""}</span>
              </div>
              <button type="submit" disabled={busy} className="btn btn-ink mt-1 !min-h-[54px] rounded-2xl">
                {busy && <Spinner />} Continue to business setup <Icon name="arrowRight" />
              </button>
              <p className="text-center text-[13px] text-muted">By continuing you agree to the Terms and Privacy Policy.</p>
            </form>
          </AuthItem>
          <AuthItem>
            <p className="text-center text-[15px] text-muted">
              Already have an account? <Link href="/auth/login" className="font-semibold text-ink underline-offset-4 hover:underline">Log in</Link>
            </p>
          </AuthItem>
        </AuthStagger>
      </div>
    </div>
  );
}
