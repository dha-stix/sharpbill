"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const WORDS = ["Any currency", "PDF in one click", "Send by email", "8 designs", "Auto numbering", "Client history"];
const STAR = "M0 -16 C2 -4 4 -2 16 0 C4 2 2 4 0 16 C-2 4 -4 2 -16 0 C-4 -2 -2 -4 0 -16Z";

function Band({ dark, reverse }: { dark?: boolean; reverse?: boolean }) {
  const items = [...WORDS, ...WORDS];
  return (
    <div className={`flex w-max gap-10 whitespace-nowrap font-display text-[clamp(1.25rem,2.4vw,1.75rem)] font-extrabold ${reverse ? "animate-marquee-reverse" : "animate-marquee"} ${dark ? "text-paper" : "text-ink"}`}>
      {items.map((w, i) => (
        <span key={i} className="flex items-center gap-10">
          {w}
          <svg width="20" height="20" viewBox="-16 -16 32 32" aria-hidden="true"><path d={STAR} fill={dark ? "#C8F031" : "#0E1116"} /></svg>
        </span>
      ))}
    </div>
  );
}

/** Two crossing skewed marquee bands; their tilt eases with scroll. */
export default function Ticker() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotA = useTransform(scrollYProgress, [0, 1], [5, 1]);
  const rotB = useTransform(scrollYProgress, [0, 1], [-5, -1]);

  return (
    <div ref={ref} aria-hidden="true" className="relative -mt-10 mb-10 h-[170px] overflow-hidden">
      <motion.div style={{ rotate: rotA }} className="absolute inset-x-[-5%] top-10 overflow-hidden border-y-2 border-ink bg-lime py-4">
        <Band reverse />
      </motion.div>
      <motion.div style={{ rotate: rotB }} className="absolute inset-x-[-5%] top-12 overflow-hidden bg-ink py-4">
        <Band dark />
      </motion.div>
    </div>
  );
}
