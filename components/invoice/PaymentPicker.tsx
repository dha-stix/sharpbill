"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/format";
import BankFields from "./BankFields";
import type { InvoicePayment, PaymentSettings } from "@/lib/types";

type Mode = "default-link" | "bank" | "custom";

/** Payment method for one invoice. Starts from Settings defaults; any field can be overridden here. */
export default function PaymentPicker({ value, onChange, defaults }: { value: InvoicePayment; onChange: (p: InvoicePayment) => void; defaults: PaymentSettings }) {
  const mode: Mode = value.type === "bank" ? "bank" : value.link === defaults.link ? "default-link" : "custom";

  const options: { id: Mode; title: string; desc: string; icon: string }[] = [
    { id: "default-link", title: "Payment link", desc: defaults.link ? "Default · from Settings" : "Add one in Settings", icon: "link" },
    { id: "bank", title: "Bank transfer", desc: "Show account details", icon: "bank" },
    { id: "custom", title: "Custom link", desc: "Just for this invoice", icon: "edit" },
  ];

  function pick(id: Mode) {
    if (id === "default-link") onChange({ ...value, type: "link", link: defaults.link });
    if (id === "bank") onChange({ ...value, type: "bank", bank: value.bank.accountNumber ? value.bank : defaults.bank });
    if (id === "custom") onChange({ ...value, type: "link", link: value.link && value.link !== defaults.link ? value.link : "" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2.5 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={mode === o.id}
            onClick={() => pick(o.id)}
            className={cn("relative flex items-start gap-3 rounded-2xl border-[1.5px] p-3.5 text-left transition-colors", mode === o.id ? "border-ink" : "border-line-2 hover:border-slate")}
          >
            {mode === o.id && <motion.span layoutId="pay-mode" className="absolute inset-0 rounded-[14px] bg-lime-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative mt-0.5"><Icon name={o.icon} /></span>
            <span className="relative">
              <span className="block font-semibold">{o.title}</span>
              <span className="block text-[13px] text-muted">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {mode === "bank" ? (
            <BankFields value={value.bank} onChange={(bank) => onChange({ ...value, bank })} />
          ) : (
            <Input
              label="Payment link"
              type="url"
              readOnly={mode === "default-link"}
              value={value.link}
              placeholder="https://pay.example.com/your-link"
              onChange={(e) => onChange({ ...value, type: "link", link: e.target.value })}
              hint={mode === "default-link" ? <>Change your default in <Link href="/settings#payment" className="underline">Settings</Link>, or choose “Custom link”.</> : undefined}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
