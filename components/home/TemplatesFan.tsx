"use client";

import { motion, useInView, type Variants } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { TEMPLATES } from "@/components/templates/registry";
import { Reveal, SplitText } from "@/components/ui/Motion";
import type { TemplateId } from "@/lib/types";

const FAN: { id: TemplateId; chip: string; rest: number; spread: number }[] = [
  { id: "hourly", chip: "$1,615", rest: -2, spread: -2 },
  { id: "proforma", chip: "$4,070", rest: -1, spread: -1 },
  { id: "standard", chip: "$4,500", rest: 0, spread: 0 },
  { id: "milestone", chip: "$5,000", rest: 1, spread: 1 },
  { id: "credit", chip: "PAID", rest: 2, spread: 2 },
];

/** A fanned deck of invoice design cards that spreads out on hover / tap. */
export default function TemplatesFan() {
  const [open, setOpen] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const shown = useInView(deckRef, { once: true, margin: "-80px" });

  const card: Variants = {
    hidden: { y: 200, opacity: 0, rotate: 0 },
    rest: (i: number) => ({ y: Math.abs(FAN[i].rest) * 6, x: FAN[i].rest * 100, rotate: FAN[i].rest * 7, opacity: 1, transition: { type: "spring", stiffness: 160, damping: 18, delay: i * 0.06 } }),
    open: (i: number) => ({ y: FAN[i].spread === 0 ? -36 : -16 + Math.abs(FAN[i].spread) * 6, x: FAN[i].spread * 155, rotate: FAN[i].spread * 9, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20 } }),
  };

  return (
    <section id="templates" className="scroll-mt-24 px-4 pt-20 sm:px-6">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 text-center">
        <Reveal><span className="eyebrow">Hover the deck</span></Reveal>
        <h2 className="section-title">
          <SplitText text="8 invoice designs." /> <br />
          <SplitText text="One simple form." delay={0.2} />
        </h2>
      </div>

      <motion.div
        className="relative mx-auto mt-12 h-[360px] max-w-[1000px] overflow-hidden sm:overflow-visible"
        ref={deckRef}
        initial="hidden"
        animate={!shown ? "hidden" : open ? "open" : "rest"}
        onHoverStart={() => setOpen(true)}
        onHoverEnd={() => setOpen(false)}
        onTap={() => setOpen((o) => !o)}
      >
        {FAN.map((f, i) => {
          const t = TEMPLATES[f.id];
          return (
            <motion.div
              key={f.id}
              custom={i}
              variants={card}
              className="absolute bottom-0 left-1/2 -ml-[110px] h-[300px] w-[220px]"
              style={{ zIndex: 5 - Math.abs(f.rest), originY: 1.2 }}
            >
              <div className="flex h-full flex-col overflow-hidden rounded-[18px] border-2 border-ink bg-white shadow-[0_20px_40px_-24px_rgba(14,17,22,.5)]">
                <div className="flex items-center justify-between p-4" style={{ background: t.swatch.bg }}>
                  <span className="font-display font-extrabold" style={{ color: t.swatch.ink }}>{t.name}</span>
                  <span className="size-[18px] rounded-[5px]" style={{ background: t.swatch.accent }} />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  {[100, 80, 60].map((w) => <span key={w} className="h-[7px] rounded bg-[#EDEDE6]" style={{ width: `${w}%` }} />)}
                  <span className="mt-2.5 h-[7px] rounded bg-[#EDEDE6]" />
                  <span className="h-[7px] w-[70%] rounded bg-[#EDEDE6]" />
                  <span className="mt-auto self-end rounded-md px-2.5 py-1.5 font-mono text-xs font-bold" style={{ background: t.swatch.bg, color: t.swatch.ink }}>{f.chip}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="mt-9 text-center">
        <Link href="/templates" className="border-b-2 border-ink pb-0.5 font-semibold">Browse all 8 designs →</Link>
      </div>
    </section>
  );
}
