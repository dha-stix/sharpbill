"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/format";
import type { TemplateId } from "@/lib/types";
import { TEMPLATES } from "./registry";
import { sampleInvoice } from "./sample";
import ScaledDocument from "./ScaledDocument";

/** Design preview card rendering the real design with sample data. */
export default function TemplateCard({ id, selected, onSelect, cta }: { id: TemplateId; selected?: boolean; onSelect?: () => void; cta?: React.ReactNode }) {
  const t = TEMPLATES[id];
  const sample = useMemo(() => sampleInvoice(id), [id]);
  const Wrapper = onSelect ? motion.button : motion.article;

  return (
    <Wrapper
      type={onSelect ? "button" : undefined}
      onClick={onSelect}
      aria-pressed={onSelect ? selected : undefined}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={cn(
        "group flex flex-col gap-3.5 rounded-[22px] border bg-white p-3.5 text-left transition-[border-color,box-shadow] hover:shadow-[0_28px_50px_-28px_rgba(14,17,22,.45)]",
        selected ? "border-2 border-ink shadow-hard" : "border-line"
      )}
    >
      <div className="relative overflow-hidden rounded-[14px] p-5" style={{ background: t.swatch.bg }}>
        <div className="h-[260px] overflow-hidden rounded-md shadow-[0_16px_30px_-18px_rgba(14,17,22,.6)] transition-transform duration-500 group-hover:-rotate-1 group-hover:scale-[1.03]">
          <ScaledDocument invoice={sample} />
        </div>
        {selected && (
          <motion.span layoutId="tpl-check" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-ink text-lime">
            ✓
          </motion.span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-1.5 pb-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[19px] font-bold">{t.name}</h3>
          <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[11px] text-muted">{t.group}</span>
        </div>
        <p className="text-sm leading-relaxed text-muted">{t.look}</p>
        <p className="text-[13px] text-slate"><span className="text-muted">Best for</span> · {t.bestFor}</p>
        {cta}
      </div>
    </Wrapper>
  );
}
