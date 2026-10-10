"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/format";
import type { TemplateId } from "@/lib/types";
import { DESIGN_GROUPS, TEMPLATE_LIST, type DesignGroup } from "./registry";
import TemplateCard from "./TemplateCard";

type Filter = DesignGroup | "All";

/** Filterable grid of invoice designs, shared by the picker and the Templates page. */
export default function DesignGallery({
  selected,
  onSelect,
  cta,
}: {
  selected?: TemplateId;
  onSelect?: (id: TemplateId) => void;
  cta?: (id: TemplateId) => ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const list = filter === "All" ? TEMPLATE_LIST : TEMPLATE_LIST.filter((t) => t.group === filter);

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Filter designs" className="scrollbar-none flex max-w-full gap-1 self-start overflow-x-auto rounded-2xl border border-line bg-white p-1">
        {(["All", ...DESIGN_GROUPS] as Filter[]).map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={filter === g}
            onClick={() => setFilter(g)}
            className={cn("relative min-h-10 whitespace-nowrap rounded-xl px-4 text-sm transition-colors", filter === g ? "text-white" : "text-slate hover:text-ink")}
          >
            {filter === g && <motion.span layoutId="design-filter" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{g}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((t, i) => (
          <motion.div
            key={`${filter}-${t.id}`}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <TemplateCard id={t.id} selected={selected === t.id} onSelect={onSelect ? () => onSelect(t.id) : undefined} cta={cta?.(t.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
