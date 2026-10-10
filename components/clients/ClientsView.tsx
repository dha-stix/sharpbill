"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import { Avatar, EmptyState, PageLoader } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { staggerItem } from "@/components/ui/Motion";
import { useClients, useInvoices } from "@/hooks/useData";
import { formatCompact } from "@/lib/format";
import { countByClient } from "@/lib/invoice-utils";
import ClientFormDrawer from "./ClientFormDrawer";

export default function ClientsView() {
  const { clients, loading } = useClients();
  const { invoices } = useInvoices();
  const counts = useMemo(() => countByClient(invoices), [invoices]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) : clients;
  }, [clients, query]);

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="The businesses you bill. Each keeps its own invoice history and order count."
        actions={
          <>
            <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-white px-3.5">
              <Icon name="search" className="text-muted" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients" aria-label="Search clients" className="w-40 bg-transparent outline-none" />
            </label>
            <button type="button" className="btn btn-ink" onClick={() => setOpen(true)}><Icon name="plus" /> Add client</button>
          </>
        }
      />

      {clients.length === 0 ? (
        <EmptyState icon="clients" title="Add your first client" body="Save a client once and every invoice for them is pre-filled." action={<button className="btn btn-lime" onClick={() => setOpen(true)}>Add client</button>} />
      ) : (
        <motion.div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
          {list.map((c) => {
            return (
              <motion.div key={c.id} variants={staggerItem} layout>
                <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                  <Link href={`/clients/${c.id}`} className="card flex flex-col gap-4 p-5 transition-[border-color,box-shadow] hover:border-ink hover:shadow-[0_24px_44px_-26px_rgba(14,17,22,.4)]">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size={48} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[17px] font-semibold">{c.name}</div>
                        <div className="truncate text-[13px] text-muted">{[c.address?.city, c.address?.country].filter(Boolean).join(", ") || c.email}</div>
                      </div>
                      <span className="rounded-md bg-paper px-2 py-1 font-mono text-xs">{c.currency}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-[#F0F0EA] pt-3.5">
                      <div><div className="text-xs text-muted">Invoices</div><div className="mt-0.5 font-mono font-medium">{counts[c.id] || 0}</div></div>
                      <div><div className="text-xs text-muted">Billed</div><div className="mt-0.5 font-mono font-medium">{formatCompact(c.totalBilled, c.currency)}</div></div>
                      <div><div className="text-xs text-muted">Email</div><div className="mt-0.5 truncate text-sm">{c.email}</div></div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      {clients.length > 0 && list.length === 0 && <p className="py-10 text-center text-muted">No clients match “{query}”.</p>}

      <ClientFormDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
