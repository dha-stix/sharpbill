"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Globe } from "@/components/illustrations/FeatureIllustrations";
import { CountUp, Reveal, SplitText } from "@/components/ui/Motion";
import { cn } from "@/lib/format";

const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "NGN", symbol: "₦", rate: 1550 },
  { code: "KES", symbol: "KSh ", rate: 129 },
  { code: "CAD", symbol: "C$", rate: 1.37 },
];

const STYLES = [
  { name: "Monolith", head: "#0E1116", fg: "#FFFFFF", accent: "#C8F031", title: "Invoice" },
  { name: "Blueprint", head: "#14234B", fg: "#FFFFFF", accent: "#7DD3FC", title: "Invoice" },
  { name: "Atelier", head: "#FBF4EA", fg: "#9A3412", accent: "#EA580C", title: "Invoice" },
  { name: "Emerald", head: "#0F3D2E", fg: "#FFFFFF", accent: "#86EFAC", title: "Invoice" },
];

const LINES = [
  ["Product strategy workshop", 1800],
  ["UI design · 12 screens", 3600],
  ["Design QA · 6h", 450],
] as const;

/** Interactive "try it" block: switch currency and design, invoice re-renders. */
export default function Demo() {
  const [cur, setCur] = useState(CURRENCIES[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const fmt = (usd: number) => cur.symbol + Math.round(usd * cur.rate).toLocaleString("en-US");
  const total = LINES.reduce((s, [, v]) => s + v, 0);

  return (
    <section id="demo" className="relative mx-auto flex max-w-[1240px] scroll-mt-24 flex-wrap items-center gap-14 px-4 pb-28 pt-20 sm:px-6">
      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
        <Reveal><span className="eyebrow">Try it — tap around</span></Reveal>
        <SplitText as="h2" className="section-title" text="One invoice. Any client. Anywhere." />
        <Reveal delay={0.1}>
          <p className="max-w-[440px] text-[17px] leading-relaxed text-[#4A5060]">
            Switch the currency and design below and watch the invoice change. That’s exactly how fast it works in the app.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mb-2.5 text-sm font-semibold">Currency</div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Currency">
            {CURRENCIES.map((c) => (
              <motion.button
                key={c.code}
                role="radio"
                aria-checked={cur.code === c.code}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setCur(c)}
                className={cn("relative min-h-11 rounded-full border-2 border-ink px-4 font-mono text-sm font-medium", cur.code === c.code ? "text-lime" : "bg-white")}
              >
                {cur.code === c.code && <motion.span layoutId="cur-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <span className="relative">{c.code}</span>
              </motion.button>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mb-2.5 text-sm font-semibold">Design</div>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Design">
            {STYLES.map((s) => (
              <motion.button
                key={s.name}
                role="radio"
                aria-checked={style.name === s.name}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setStyle(s)}
                className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border-2 bg-white py-0 pl-2 pr-4 text-sm", style.name === s.name ? "border-ink" : "border-line-2")}
              >
                <span className="size-6 rounded-full border-2" style={{ background: s.head, borderColor: s.accent }} />
                {s.name}
              </motion.button>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="relative flex min-w-0 flex-[1_1_440px] justify-center py-8">
        <Globe className="absolute left-1/2 top-1/2 w-[120%] max-w-[560px] -translate-x-1/2 -translate-y-1/2" />
        <motion.div
          initial={{ opacity: 0, rotate: -4, y: 40 }}
          whileInView={{ opacity: 1, rotate: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          animate={{ boxShadow: `-14px 14px 0 ${style.accent}` }}
          className="relative w-full max-w-[400px] overflow-hidden rounded-[22px] border-2 border-ink bg-white"
        >
          <motion.div animate={{ backgroundColor: style.head, color: style.fg }} transition={{ duration: 0.4 }} className="flex items-center justify-between px-6 py-5">
            <AnimatePresence mode="wait">
              <motion.span key={style.name} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className="font-display text-2xl font-extrabold">
                {style.title}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-[13px] opacity-80">INV-027</span>
          </motion.div>
          <div className="flex flex-col gap-3 px-6 py-5 text-sm">
            <div className="flex justify-between text-[13px] text-muted"><span>Bluehaus GmbH · Berlin</span><span>Order #005</span></div>
            {LINES.map(([d, v]) => (
              <div key={d} className="flex justify-between border-b border-[#F0F0EA] pb-2.5">
                <span>{d}</span>
                <AnimatePresence mode="popLayout">
                  <motion.span key={cur.code + d} className="font-mono" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                    {fmt(v)}
                  </motion.span>
                </AnimatePresence>
              </div>
            ))}
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="font-semibold">Total</span>
              <CountUp key={cur.code} value={total * cur.rate} duration={0.8} format={(n) => cur.symbol + Math.round(n).toLocaleString("en-US")} className="font-display text-4xl font-extrabold tracking-tight" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
