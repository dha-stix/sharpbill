"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { TemplateMeta } from "@/components/templates/registry";
import { Icon } from "@/components/ui/Icon";
import { formatMoney, uid } from "@/lib/format";
import { lineAmount } from "@/lib/invoice-utils";
import type { LineItem } from "@/lib/types";

const W = { qty: "w-20", rate: "w-28", amount: "w-28" };

export function newItem(): LineItem {
  return { id: uid(), description: "", quantity: 1, rate: 0 };
}

/** Line items (description × qty × rate); rows wrap into cards on small screens. */
export default function LineItemsEditor({
  items,
  onChange,
  meta,
  currency,
}: {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  meta: TemplateMeta;
  currency: string;
}) {
  const c = meta.columns;
  const update = (id: string, patch: Partial<LineItem>) => onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden items-center gap-2 text-xs uppercase tracking-wider text-muted md:flex">
        <span className="flex-1">{c.desc}</span>
        <span className={W.qty}>{c.qty}</span>
        <span className={W.rate}>{c.rate}</span>
        <span className={`${W.amount} text-right`}>{c.amount}</span>
        <span className="w-9" />
      </div>

      <AnimatePresence initial={false}>
        {items.map((it) => (
          <motion.div
            key={it.id}
            layout
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-paper-2 p-3 md:flex-nowrap md:border-0 md:bg-transparent md:p-0"
          >
            <div className="flex min-w-[200px] flex-[1_1_220px] flex-col gap-1">
              <input aria-label={c.desc} placeholder={c.desc} className="field" value={it.description} onChange={(e) => update(it.id, { description: e.target.value })} />
              <input aria-label="Details" placeholder="Details (optional)" className="field !min-h-9 text-sm" value={it.details || ""} onChange={(e) => update(it.id, { details: e.target.value })} />
            </div>
            <input type="number" min={0} step="any" aria-label={c.qty} className={`field font-mono ${W.qty}`} value={it.quantity} onChange={(e) => update(it.id, { quantity: num(e.target.value) })} />
            <input type="number" min={0} step="any" aria-label={c.rate} className={`field font-mono ${W.rate}`} value={it.rate} onChange={(e) => update(it.id, { rate: num(e.target.value) })} />
            <span className={`${W.amount} flex-1 text-right font-mono font-medium md:flex-none`}>{formatMoney(lineAmount(it), currency)}</span>
            <button type="button" aria-label="Remove item" disabled={items.length === 1} onClick={() => remove(it.id)} className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-white text-muted transition hover:border-danger hover:text-danger disabled:opacity-40">
              <Icon name="close" size={14} strokeWidth={2.4} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onChange([...items, newItem()])}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border-[1.5px] border-dashed border-ink px-4 font-semibold"
      >
        <Icon name="plus" size={16} strokeWidth={2.4} /> Add line item
      </motion.button>
    </div>
  );
}
