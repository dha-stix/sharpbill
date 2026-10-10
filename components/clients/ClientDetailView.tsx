"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import InvoiceTable from "@/components/app/InvoiceTable";
import PageHeader from "@/components/app/PageHeader";
import { Avatar, EmptyState, PageLoader, SectionCard } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { CountUp } from "@/components/ui/Motion";
import { useToast } from "@/components/ui/Toast";
import { useClient, useInvoices } from "@/hooks/useData";
import { deleteClient } from "@/lib/firebase-actions";
import { addressLines, formatDate, formatMoney } from "@/lib/format";
import { effectiveStatus, formatOrderNumber } from "@/lib/invoice-utils";
import DeleteInvoiceDialog from "@/components/invoice/DeleteInvoiceDialog";
import type { Invoice } from "@/lib/types";
import ClientFormDrawer from "./ClientFormDrawer";

export default function ClientDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { client, loading } = useClient(id);
  const { invoices } = useInvoices(id);
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Invoice | null>(null);

  const outstanding = useMemo(
    // Shown in the client's currency, so only invoices in that currency are added up.
    () => invoices.filter((i) => i.currency === client?.currency && ["SENT", "OVERDUE"].includes(effectiveStatus(i))).reduce((s, i) => s + i.total, 0),
    [invoices, client?.currency]
  );

  if (loading) return <PageLoader />;
  if (!client)
    return <EmptyState icon="clients" title="Client not found" body="This client may have been deleted." action={<Link href="/clients" className="btn btn-ink">Back to clients</Link>} />;

  const money = (n: number) => formatMoney(n, client.currency);
  const details: [string, React.ReactNode][] = [
    ["Contact", client.contactName || "—"],
    ["Billing email", client.email],
    ["Phone", client.phone || "—"],
    ["Billing address", addressLines(client.address).length ? addressLines(client.address).map((l) => <div key={l}>{l}</div>) : "—"],
    ["Tax ID", client.taxId ? <span className="font-mono">{client.taxId}</span> : "—"],
    ["Currency", client.currency],
  ];

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/clients", label: "Clients" }]}
        title={
          <span className="flex items-center gap-4">
            <Avatar name={client.name} size={60} className="!rounded-2xl" />
            {client.name}
          </span>
        }
        subtitle={client.createdAt ? `Client since ${formatDate(client.createdAt, { month: "long", year: "numeric" })}` : undefined}
        actions={
          <>
            <button className="btn btn-danger" onClick={() => setConfirm(true)}><Icon name="trash" size={16} /> Delete</button>
            <button className="btn btn-outline" onClick={() => setEditing(true)}><Icon name="edit" size={16} /> Edit details</button>
            <Link href={`/invoice/create?client=${client.id}`} className="btn btn-ink"><Icon name="plus" /> Invoice this client</Link>
          </>
        }
      />

      <AnimatePresence>
        {confirm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FBE6E4] px-5 py-4 text-[#7A1A13]">
              <span><strong>Delete {client.name}?</strong> Their {invoices.length} invoice{invoices.length === 1 ? "" : "s"} stay in your records, but the client profile is removed.</span>
              <span className="flex gap-2">
                <button className="btn btn-outline" onClick={() => setConfirm(false)}>Keep</button>
                <button
                  className="btn bg-danger text-white"
                  onClick={async () => {
                    await deleteClient(client.id);
                    toast("Client deleted");
                    router.replace("/clients");
                  }}
                >
                  Delete client
                </button>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {[
          { label: "Total billed", value: <CountUp trigger="mount" value={client.totalBilled} format={money} /> },
          { label: "Outstanding", value: <CountUp trigger="mount" value={outstanding} format={money} /> },
          { label: "Invoices issued", value: <CountUp trigger="mount" value={invoices.length} /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card px-5 py-4">
            <div className="text-[13px] text-muted">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-extrabold sm:text-[28px]">{s.value}</div>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="rounded-[20px] bg-ink px-5 py-4 text-white">
          <div className="text-[13px] text-soft">Next order number</div>
          <div className="mt-1 font-mono text-2xl font-bold text-lime sm:text-[28px]">{formatOrderNumber(client.invoiceCount + 1)}</div>
        </motion.div>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
        <SectionCard title="Billing details" aside={<button className="btn btn-ghost !min-h-9 text-sm" onClick={() => setEditing(true)}>Edit</button>}>
          <dl className="flex flex-col gap-4">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
                <dd className="mt-1 text-[15px] leading-relaxed">{v}</dd>
              </div>
            ))}
            {client.notes && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted">Notes</dt>
                <dd className="mt-1 whitespace-pre-line text-[15px]">{client.notes}</dd>
              </div>
            )}
          </dl>
        </SectionCard>

        <section className="card min-w-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-display text-xl font-bold">Invoice history</h2>
            <span className="text-sm text-muted">{invoices.length} invoice{invoices.length === 1 ? "" : "s"}</span>
          </div>
          {invoices.length ? (
            <InvoiceTable invoices={invoices} columns={["order", "number", "issued", "status", "amount"]} minWidth={600} onDelete={setToDelete} />
          ) : (
            <p className="px-6 pb-8 text-muted">No invoices yet for this client.</p>
          )}
        </section>
      </div>

      <ClientFormDrawer open={editing} onClose={() => setEditing(false)} client={client} />
      <DeleteInvoiceDialog invoice={toDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
