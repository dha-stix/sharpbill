"use client";

import { motion } from "framer-motion";
import { useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { STATUS_STYLES, CURRENCIES } from "@/lib/constants";
import { cn, initials } from "@/lib/format";
import type { InvoiceStatus } from "@/lib/types";
import { Icon } from "./Icon";

/* ---------- form fields ---------- */

type Labelled = { label: ReactNode; hint?: ReactNode; className?: string };

export function Input({ label, hint, className, ...props }: Labelled & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("label", className)}>
      {label}
      <input className="field" {...props} />
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Textarea({ label, hint, className, ...props }: Labelled & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={cn("label", className)}>
      {label}
      <textarea className="field" {...props} />
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Select({ label, hint, className, children, ...props }: Labelled & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={cn("label", className)}>
      {label}
      <select className="field" {...props}>{children}</select>
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function CurrencySelect(props: Omit<Labelled, "label"> & { label?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select label={props.label ?? "Currency"} {...props}>
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>
      ))}
    </Select>
  );
}

/* ---------- display ---------- */

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide", s.bg, s.fg)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}

const AVATAR_TONES = ["bg-lime", "bg-[#E4ECFF]", "bg-[#FFF1E0]", "bg-[#EEF6F0]", "bg-[#F3EEFF]", "bg-[#EDEDE6]"];

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  const tone = AVATAR_TONES[(name.charCodeAt(0) || 0) % AVATAR_TONES.length];
  if (src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className={cn("shrink-0 rounded-xl object-cover", className)} style={{ width: size, height: size }} />;
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl font-display font-bold text-ink", tone, className)} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} aria-hidden="true" />;
}

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <div className="flex flex-col items-center gap-4">
        <motion.span
          className="size-12 rounded-2xl bg-ink"
          animate={{ rotate: [0, 90, 180, 270, 360], borderRadius: ["16px", "50%", "16px", "50%", "16px"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-sm text-muted">{label}…</span>
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action, icon = "invoice" }: { title: string; body: string; action?: ReactNode; icon?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
      <motion.span
        className="grid size-16 place-items-center rounded-2xl bg-lime"
        animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon name={icon} size={28} />
      </motion.span>
      <h3 className="font-display text-2xl font-extrabold">{title}</h3>
      <p className="max-w-sm text-muted">{body}</p>
      {action}
    </motion.div>
  );
}

export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn("btn btn-outline shrink-0", copied && "!bg-lime !border-lime", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      <Icon name={copied ? "check" : "copy"} size={16} />
      {copied ? "Copied" : label}
    </button>
  );
}

export function SectionCard({ title, description, children, aside, id, className }: { title: ReactNode; description?: ReactNode; children: ReactNode; aside?: ReactNode; id?: string; className?: string }) {
  return (
    <section id={id} className={cn("card scroll-mt-6 p-5 sm:p-6", className)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
