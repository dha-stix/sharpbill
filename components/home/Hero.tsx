"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import HeroIllustration from "@/components/illustrations/HeroIllustration";
import { Icon } from "@/components/ui/Icon";
import { EASE } from "@/components/ui/Motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: EASE },
});

const HEADLINE = [["Invoices"], ["that", "get", "you"]];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [0, -6]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section ref={ref} className="relative mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 px-4 pb-28 pt-10 sm:px-6 lg:pt-16">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute -left-20 top-4 size-[420px] opacity-60 [mask-image:radial-gradient(circle,black,transparent_70%)]" />

      <motion.div style={{ y: textY }} className="relative flex min-w-0 flex-[1_1_480px] flex-col gap-7">
        <motion.span {...fadeUp(0)} className="inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-sm text-slate shadow-[0_6px_16px_-10px_rgba(14,17,22,.3)]">
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-lime">NEW</span>
          Send invoices by email, PDF attached
        </motion.span>

        <h1 className="font-display text-[clamp(3.1rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.045em]" aria-label="Invoices that get you paid.">
          {HEADLINE.map((line, li) => (
            <span key={li} className="block">
              {line.map((w, wi) => (
                <span key={w}>
                <span className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", rotate: 6 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ duration: 0.85, delay: 0.1 + (li * 2 + wi) * 0.08, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                </span>{" "}
                </span>
              ))}
              {li === 1 && (
                <span className="relative inline-block whitespace-nowrap">
                  <motion.span
                    aria-hidden="true"
                    className="absolute -left-2.5 -right-3.5 bottom-[6%] top-[18%] -z-0 rounded-lg bg-lime"
                    style={{ skewX: -12, rotate: -2, originX: 0 }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
                  />
                  <motion.span className="relative inline-block" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.55 }}>
                    paid.
                  </motion.span>
                  <svg aria-hidden="true" viewBox="0 0 220 30" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-5 h-6 w-full">
                    <motion.path d="M4 20 C 50 6, 110 4, 216 14" fill="none" stroke="#0E1116" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 1.1, ease: "easeInOut" }} />
                  </svg>
                </span>
              )}
            </span>
          ))}
        </h1>

        <motion.p {...fadeUp(0.5)} className="mt-2 max-w-[500px] text-lg leading-relaxed text-[#4A5060] sm:text-[19px]">
          SharpBill turns your work into polished invoices in any currency — emailed to clients from the app or downloaded as print-ready PDFs.
        </motion.p>

        <motion.div {...fadeUp(0.65)} className="flex flex-wrap items-center gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/auth/register" className="btn btn-lime btn-pill !min-h-[58px] border-2 !border-ink !px-7 text-base">
              Create your first invoice <Icon name="arrowRight" />
            </Link>
          </motion.div>
          <a href="#demo" className="group inline-flex items-center gap-3 px-4 py-4 font-medium">
            <span className="relative grid size-10 place-items-center rounded-full border-[1.5px] border-ink transition group-hover:bg-ink group-hover:text-lime">
              <Icon name="play" size={12} className="fill-current" />
            </span>
            See it in action
          </a>
        </motion.div>

        <motion.ul {...fadeUp(0.8)} className="flex flex-wrap gap-5 text-sm text-slate">
          {["Google sign-in", "8 invoice designs", "Any currency"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Icon name="check" size={16} strokeWidth={3} className="text-lime-deep" />
              {t}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* stage */}
      <motion.div style={{ y: stageY }} className="relative h-[480px] min-w-0 flex-[1_1_440px] sm:h-[580px]">
        <HeroIllustration />

        <motion.div
          initial={{ opacity: 0, y: 60, rotate: 6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: EASE }}
          className="absolute left-1/2 top-1/2 w-[min(380px,86%)] -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            style={{ rotate: cardRotate }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-[22px] border-2 border-ink bg-white p-6 shadow-[14px_14px_0_#0E1116]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-[11px] bg-ink font-display font-bold text-lime">SA</span>
                <div>
                  <div className="text-[15px] font-semibold">Studio Ade</div>
                  <div className="text-xs text-muted">Lagos, Nigeria</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-extrabold">Invoice</div>
                <div className="font-mono text-xs text-muted">INV-024</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between rounded-xl bg-paper px-3.5 py-3 text-[13px]">
              <div><div className="text-muted">Billed to</div><div className="font-semibold">Northwind Labs</div></div>
              <div className="text-right"><div className="text-muted">Due</div><div className="font-semibold">Oct 24</div></div>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              {[["Brand identity", "$2,400"], ["Landing page", "$1,800"], ["Revisions · 4h", "$300"]].map(([k, v], i) => (
                <motion.div key={k} className="flex justify-between" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.12 }}>
                  <span>{k}</span>
                  <span className="font-mono">{v}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t-2 border-dashed border-line-2 pt-3.5">
              <span className="text-sm text-muted">Total</span>
              <span className="font-display text-[32px] font-extrabold tracking-tight">$4,500</span>
            </div>
            <div className="mt-3.5 rounded-xl bg-ink py-3 text-center text-sm font-medium text-white">Pay via payment link →</div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 1.3 }}
          className="absolute right-0 top-10 hidden items-center gap-2.5 rounded-2xl border-2 border-ink bg-white px-3.5 py-2.5 sm:flex"
        >
          <span className="relative grid size-7 place-items-center">
            <motion.span className="absolute inset-0 rounded-full bg-[#7BA30A]" animate={{ scale: [0.8, 1.8], opacity: [0.7, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="relative grid size-7 place-items-center rounded-full bg-lime-deep text-white"><Icon name="check" size={14} strokeWidth={3} /></span>
          </span>
          <div className="text-[13px] leading-tight"><div className="font-bold">Paid · $1,350</div><div className="text-muted">INV-023 · Northwind</div></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{ opacity: { delay: 1.6 }, x: { delay: 1.6, type: "spring" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 } }}
          className="absolute bottom-8 right-2 hidden -rotate-3 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white sm:flex"
        >
          <Icon name="mail" size={22} className="text-lime" />
          <div className="text-[13px] leading-snug"><div className="font-semibold">Emailed to Northwind</div><div className="text-[#A9AEB9]">INV-024.pdf attached</div></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
