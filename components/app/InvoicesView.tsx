"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, PageLoader } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { useInvoices } from "@/hooks/useData";
import { cn } from "@/lib/format";
import { effectiveStatus } from "@/lib/invoice-utils";
import DeleteInvoiceDialog from "@/components/invoice/DeleteInvoiceDialog";
import type { Invoice, InvoiceStatus } from "@/lib/types";
import InvoiceTable from "./InvoiceTable";
import PageHeader from "./PageHeader";

const FILTERS: (InvoiceStatus | "ALL")[] = ["ALL", "SAVED", "SENT", "PAID", "OVERDUE"];
const SORTS = { newest: "Newest first", due: "Due date", amount: "Amount" } as const;

export default function InvoicesView() {
  const { invoices, loading } = useInvoices();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("newest");
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: invoices.length };
    invoices.forEach((i) => (c[effectiveStatus(i)] = (c[effectiveStatus(i)] || 0) + 1));
    return c;
  }, [invoices]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = invoices.filter(
      (i) => (filter === "ALL" || effectiveStatus(i) === filter) && (!q || i.number.toLowerCase().includes(q) || i.client.name.toLowerCase().includes(q))
    );
    if (sort === "due") list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (sort === "amount") list.sort((a, b) => b.total - a.total);
    return list;
  }, [invoices, filter, query, sort]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"} in total`}
        actions={<Link href="/invoice/create" className="btn btn-ink"><Icon name="plus" /> New invoice</Link>}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter by status" className="scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn("relative min-h-10 whitespace-nowrap rounded-xl px-4 text-sm transition-colors", filter === f ? "text-white" : "text-slate hover:text-ink")}
            >
              {filter === f && <motion.span layoutId="inv-filter" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">
                {f === "ALL" ? "All" : f[0] + f.slice(1).toLowerCase()} <span className="ml-1 font-mono opacity-60">{counts[f] || 0}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5">
            <Icon name="search" className="text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search number or client" aria-label="Search invoices" className="w-48 bg-transparent outline-none" />
          </label>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="field !min-h-11 !w-auto">
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" body="Create your first invoice — it takes about two minutes." action={<Link href="/invoice/create" className="btn btn-lime">Create invoice</Link>} />
      ) : (
        <section className="card overflow-hidden">
          <InvoiceTable invoices={rows} columns={["number", "client", "order", "type", "issued", "due", "status", "amount"]} minWidth={960} onDelete={setToDelete} />
          {rows.length === 0 && <p className="px-6 py-10 text-center text-muted">No invoices match this filter.</p>}
          <div className="border-t border-[#F0F0EA] px-6 py-3.5 text-sm text-muted">Showing {rows.length} of {invoices.length}</div>
        </section>
      )}
      <DeleteInvoiceDialog invoice={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
