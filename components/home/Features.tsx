"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  ClientsIllustration,
  MailIllustration,
  NumberingIllustration,
  PaymentIllustration,
  PrinterIllustration,
} from "@/components/illustrations/FeatureIllustrations";
import { Reveal, SplitText, Stagger, staggerItem } from "@/components/ui/Motion";
import { cn } from "@/lib/format";

interface Feature {
  n: string;
  tag: string;
  title: string;
  body: string;
  art: ReactNode;
  tone: "dark" | "lime" | "light";
  wide?: boolean;
}

const FEATURES: Feature[] = [
  { n: "01", tag: "SEND", title: "Straight to their inbox", body: "Plug in your EmailJS key. The client’s email is pre-filled, the PDF attached, the message yours to edit.", art: <MailIllustration />, tone: "dark", wide: true },
  { n: "02", tag: "DOWNLOAD", title: "Print-ready PDFs", body: "Crisp, branded and ready to print in one click.", art: <PrinterIllustration />, tone: "lime" },
  { n: "03", tag: "COUNT", title: "Automatic numbering", body: "Serial invoice numbers plus a per-client order count.", art: <NumberingIllustration />, tone: "light" },
  { n: "04", tag: "GET PAID", title: "Link or bank transfer", body: "Set a default and override it on any invoice.", art: <PaymentIllustration />, tone: "light" },
  { n: "05", tag: "ORGANISE", title: "Client records", body: "Billing address, tax ID and full invoice history per client.", art: <ClientsIllustration />, tone: "light" },
];

const TONES = {
  dark: "bg-ink text-white",
  lime: "bg-lime border-2 border-ink",
  light: "bg-white border border-line",
};

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pb-36 pt-10 sm:px-6">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <h2 className="section-title max-w-[720px]">
          <SplitText text="Everything an invoice needs." />{" "}
          <SplitText text="Nothing it doesn’t." className="text-[#8A8F9C]" delay={0.3} />
        </h2>
        <Reveal delay={0.2}>
          <p className="max-w-[340px] text-[17px] leading-relaxed text-[#4A5060]">Set your business up once. Every invoice after that is a few fields and a click.</p>
        </Reveal>
      </div>

      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.1}>
        {FEATURES.map((f) => (
          <motion.article
            key={f.n}
            variants={staggerItem}
            whileHover={{ y: -8, rotate: -0.6, boxShadow: "0 30px 60px -30px rgba(14,17,22,.45)" }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={cn(
              "flex min-w-0 gap-6 overflow-hidden rounded-[28px] p-8",
              TONES[f.tone],
              f.wide ? "flex-wrap items-center md:col-span-2" : "flex-col"
            )}
          >
            {!f.wide && <div>{f.art}</div>}
            <div className={cn("flex min-w-0 flex-col gap-2.5", f.wide && "flex-[1_1_260px]")}>
              <span className={cn("font-mono text-[13px]", f.tone === "dark" ? "text-lime" : f.tone === "lime" ? "" : "text-muted")}>
                {f.n} — {f.tag}
              </span>
              <h3 className={cn("font-display font-bold leading-none tracking-tight", f.wide ? "text-[34px]" : "text-2xl")}>{f.title}</h3>
              <p className={cn("text-[15px] leading-relaxed", f.tone === "dark" ? "text-soft" : f.tone === "lime" ? "text-[#2A3010]" : "text-[#4A5060]")}>{f.body}</p>
            </div>
            {f.wide && <div className="flex min-w-0 flex-[1_1_240px] justify-center">{f.art}</div>}
          </motion.article>
        ))}
      </Stagger>
    </section>
  );
}
