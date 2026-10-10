"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { EASE, Reveal, SplitText } from "@/components/ui/Motion";

const STEPS = [
  { n: "01", icon: "store", title: "Set up your business", body: "Sign in with Google, add your name, address, logo and currency. Done once.", rot: -1.5 },
  { n: "02", icon: "userPlus", title: "Add your clients", body: "Save billing address, tax ID and email. Their invoice history builds itself.", rot: 1 },
  { n: "03", icon: "send", title: "Create, send, get paid", body: "Pick a design, add your items, then email it or download the PDF.", rot: -1 },
];

/** Dark, skewed section with three tilted step cards and a self-drawing connector. */
export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative scroll-mt-10 bg-ink px-4 pb-52 pt-44 text-white sm:px-6"
      style={{ clipPath: "polygon(0 6%, 100% 0, 100% 94%, 0 100%)" }}
    >
      <div aria-hidden="true" className="line-grid absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <h2 className="section-title max-w-[720px]">
            <SplitText text="From sign-up to" /> <SplitText text="sent" className="text-lime" delay={0.25} /> <SplitText text="in three moves." delay={0.35} />
          </h2>
          <Reveal delay={0.3}>
            <Link href="/auth/register" className="btn btn-lime btn-pill">Start now <Icon name="arrowRight" /></Link>
          </Reveal>
        </div>

        <svg aria-hidden="true" viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-x-0 top-[250px] hidden h-[120px] w-full md:block">
          <motion.path
            d="M120 60 C 300 -20, 420 140, 600 60 S 900 -20, 1080 60"
            fill="none"
            stroke="#C8F031"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }}
          />
        </svg>

        <div className="relative grid gap-7 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: s.rot }}
              whileHover={{ rotate: 0, y: -8, scale: 1.02 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
              className="flex flex-col gap-4 rounded-[26px] border border-ink-4 bg-[#161A22] p-7"
            >
              <div className="flex items-start justify-between">
                <span className="outline-text-lime font-display text-[76px] font-extrabold leading-[0.8]">{s.n}</span>
                <motion.span
                  className="grid size-16 place-items-center rounded-[18px] bg-lime text-ink"
                  whileInView={{ rotate: [0, -12, 8, 0] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.8 }}
                >
                  <Icon name={s.icon} size={30} />
                </motion.span>
              </div>
              <h3 className="font-display text-[28px] font-bold">{s.title}</h3>
              <p className="leading-relaxed text-soft">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
