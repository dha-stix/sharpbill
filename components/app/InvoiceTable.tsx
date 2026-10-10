"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEMPLATES } from "@/components/templates/registry";
import { StatusBadge } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { cn, formatDate, formatMoney } from "@/lib/format";
import { effectiveStatus, formatOrderNumber } from "@/lib/invoice-utils";
import type { Invoice } from "@/lib/types";

type Column = "number" | "client" | "order" | "type" | "issued" | "due" | "status" | "amount";

const HEAD: Record<Column, string> = {
  number: "Invoice",
  client: "Client",
  order: "Client order",
  type: "Design",
  issued: "Issued",
  due: "Due",
  status: "Status",
  amount: "Amount",
};

function cell(inv: Invoice, col: Column) {
  switch (col) {
    case "number":
      return <span className="font-mono font-medium">{inv.number}</span>;
    case "client":
      return <span className="font-medium">{inv.client.name}</span>;
    case "order":
      return <span className="font-mono text-muted">{formatOrderNumber(inv.clientOrderNumber)}</span>;
    case "type":
      return <span className="text-muted">{TEMPLATES[inv.template]?.name ?? inv.template}</span>;
    case "issued":
      return <span className="text-muted">{formatDate(inv.issueDate)}</span>;
    case "due":
      return <span className="text-muted">{formatDate(inv.dueDate)}</span>;
    case "status":
      return <StatusBadge status={effectiveStatus(inv)} />;
    case "amount":
      return <span className="font-mono font-medium">{formatMoney(inv.total, inv.currency)}</span>;
  }
}

/**
 * Animated, horizontally-scrollable invoice table. Rows navigate to /invoice/[id].
 * Pass `onDelete` to show row actions: edit (unpaid invoices only) and delete (the caller confirms and deletes).
 */
export default function InvoiceTable({ invoices, columns, minWidth = 760, onDelete }: { invoices: Invoice[]; columns: Column[]; minWidth?: number; onDelete?: (invoice: Invoice) => void }) {
  const router = useRouter();
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[15px]" style={{ minWidth }}>
        <thead>
          <tr className="bg-paper-2 text-left text-[13px] text-muted">
            {columns.map((c, i) => (
              <th key={c} className={cn("px-3 py-3 font-medium", i === 0 && "pl-6", i === columns.length - 1 && "pr-6", c === "amount" && "text-right")}>
                {HEAD[c]}
              </th>
            ))}
            {onDelete && <th className="w-24 pr-4"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {invoices.map((inv, r) => (
              <motion.tr
                key={inv.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(r, 10) * 0.03 } }}
                exit={{ opacity: 0 }}
                onClick={() => router.push(`/invoice/${inv.id}`)}
                className="cursor-pointer border-t border-[#F0F0EA] transition-colors hover:bg-paper-2"
              >
                {columns.map((c, i) => (
                  <td key={c} className={cn("px-3 py-4", i === 0 && "pl-6", i === columns.length - 1 && "pr-6", c === "amount" && "text-right")}>
                    {c === "number" ? <Link href={`/invoice/${inv.id}`} onClick={(e) => e.stopPropagation()}>{cell(inv, c)}</Link> : cell(inv, c)}
                  </td>
                ))}
                {onDelete && (
                  <td className="whitespace-nowrap pr-4 text-right">
                    {inv.status !== "PAID" && (
                      <Link
                        href={`/invoice/${inv.id}/edit`}
                        aria-label={`Edit ${inv.number}`}
                        title="Edit invoice"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-grid size-9 place-items-center rounded-xl border border-transparent align-middle text-muted transition hover:border-line-2 hover:bg-paper hover:text-ink"
                      >
                        <Icon name="edit" size={16} />
                      </Link>
                    )}
                    <button
                      type="button"
                      aria-label={`Delete ${inv.number}`}
                      title="Delete invoice"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(inv);
                      }}
                      className="inline-grid size-9 place-items-center rounded-xl border border-transparent align-middle text-muted transition hover:border-[#F0C9C5] hover:bg-[#FBE6E4] hover:text-danger"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </td>
                )}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
