"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import { TEMPLATES } from "@/components/templates/registry";
import ScaledDocument from "@/components/templates/ScaledDocument";
import { Avatar, CopyButton, EmptyState, PageLoader, Spinner, StatusBadge } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useInvoice } from "@/hooks/useData";
import { updateInvoiceStatus } from "@/lib/firebase-actions";
import { formatDate, formatMoney } from "@/lib/format";
import { bankText, dueLabel, effectiveStatus, formatOrderNumber } from "@/lib/invoice-utils";
import DeleteInvoiceDialog from "./DeleteInvoiceDialog";
import SendInvoiceModal from "./SendInvoiceModal";
import { OffscreenDocument, useInvoicePdf } from "./usePdf";

export default function InvoiceDetailView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { invoice, loading } = useInvoice(id);
  const { ref, make } = useInvoicePdf();
  const toast = useToast();
  const router = useRouter();
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  if (loading) return <PageLoader />;
  if (!invoice) return <EmptyState title="Invoice not found" body="It may have been deleted." action={<Link href="/invoices" className="btn btn-ink">Back to invoices</Link>} />;

  const status = effectiveStatus(invoice);
  const p = invoice.payment;
  const bankDetails = bankText(p.bank);

  async function run(key: string, fn: () => Promise<unknown>, done?: string) {
    setBusy(key);
    try {
      await fn();
      if (done) toast(done);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }

  const activity = [
    invoice.paidAt && { label: "Marked as paid", at: invoice.paidAt, dot: "bg-[#1F6B42]" },
    invoice.sentAt && { label: `Emailed to ${invoice.client.email}`, at: invoice.sentAt, dot: "bg-[#1D3FA8]" },
    invoice.createdAt && { label: `Created with the ${TEMPLATES[invoice.template]?.name} design`, at: invoice.createdAt, dot: "bg-[#8A8F9C]" },
  ].filter(Boolean) as { label: string; at: number; dot: string }[];

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/invoices", label: "Invoices" }]}
        title={<span className="flex flex-wrap items-center gap-3"><span className="font-mono">{invoice.number}</span><StatusBadge status={status} /></span>}
        subtitle={`${TEMPLATES[invoice.template]?.name} design · ${invoice.client.name} · Order ${formatOrderNumber(invoice.clientOrderNumber)}`}
        actions={
          <>
            <button className="btn btn-outline" disabled={busy === "pdf"} onClick={() => run("pdf", async () => (await make(invoice.number)).save())}>
              {busy === "pdf" ? <Spinner /> : <Icon name="download" size={16} />} Download PDF
            </button>
            <button className="btn btn-outline" onClick={() => setSendOpen(true)}><Icon name="mail" size={16} /> {invoice.sentAt ? "Resend" : "Send"}</button>
            {invoice.status !== "PAID" && <Link href={`/invoice/${invoice.id}/edit`} className="btn btn-outline"><Icon name="edit" size={16} /> Edit</Link>}
            <Link href={`/invoice/create?template=${invoice.template}&client=${invoice.clientId}`} className="btn btn-outline"><Icon name="duplicate" size={16} /> New for client</Link>
            {invoice.status !== "PAID" ? (
              <button className="btn btn-lime" disabled={busy === "paid"} onClick={() => run("paid", () => updateInvoiceStatus(invoice.id, "PAID"), "Marked as paid")}>
                {busy === "paid" ? <Spinner /> : <Icon name="check" size={16} strokeWidth={2.6} />} Mark as paid
              </button>
            ) : (
              <button className="btn btn-outline" onClick={() => run("unpaid", () => updateInvoiceStatus(invoice.id, invoice.sentAt ? "SENT" : "SAVED"), "Marked as unpaid")}>Mark unpaid</button>
            )}
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }} className="min-w-0 overflow-hidden rounded-md bg-white shadow-[0_1px_0_#E2E2DA,0_30px_60px_-36px_rgba(14,17,22,.4)]">
          <ScaledDocument invoice={invoice} />
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="flex min-w-0 flex-col gap-4">
          <div className="card p-5">
            <div className="text-sm text-muted">Amount due</div>
            <div className="mt-1 font-display text-[34px] font-extrabold tracking-tight">{formatMoney(invoice.total, invoice.currency)}</div>
            <div className={`mt-2 flex items-center gap-2 text-sm ${status === "OVERDUE" ? "text-danger" : status === "PAID" ? "text-[#1F6B42]" : "text-[#1D3FA8]"}`}>
              <Icon name="clock" size={16} /> {dueLabel(invoice)} · {formatDate(invoice.dueDate)}
            </div>
          </div>

          <div className="card flex flex-col gap-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Payment method</h2>
              <span className="rounded-md bg-paper px-2 py-0.5 text-xs">{p.type === "link" ? "Link" : "Bank"}</span>
            </div>
            {p.type === "link" ? (
              p.link ? (
                <div className="flex items-center gap-2 rounded-xl bg-paper p-2 pl-3">
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{p.link}</span>
                  <CopyButton value={p.link} className="!min-h-9 text-sm" />
                </div>
              ) : <p className="text-sm text-muted">No payment link set.</p>
            ) : (
              <>
                <pre className="whitespace-pre-wrap rounded-xl bg-paper p-3 font-mono text-[13px] leading-relaxed">{bankDetails || "No bank details set."}</pre>
                {bankDetails && <CopyButton value={bankDetails} label="Copy bank details" />}
              </>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Activity</h2>
            <ol className="flex flex-col gap-4">
              {activity.map((a, i) => (
                <motion.li key={a.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex gap-3">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${a.dot}`} />
                  <div className="text-sm">
                    <div className="font-medium">{a.label}</div>
                    <div className="text-[13px] text-muted">{new Date(a.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          <Link href={`/clients/${invoice.clientId}`} className="card flex items-center gap-3 p-4 transition hover:border-ink">
            <Avatar name={invoice.client.name} />
            <span className="flex-1"><span className="block font-semibold">{invoice.client.name}</span><span className="text-[13px] text-muted">View client →</span></span>
          </Link>

          <button className="btn btn-danger" onClick={() => setDeleteOpen(true)}>
            <Icon name="trash" size={16} /> Delete invoice
          </button>
        </motion.aside>
      </div>

      <OffscreenDocument ref={ref} invoice={invoice} />
      <SendInvoiceModal invoice={invoice} open={sendOpen} onClose={() => setSendOpen(false)} makePdf={make} />
      <DeleteInvoiceDialog invoice={deleteOpen ? invoice : null} onClose={() => setDeleteOpen(false)} onDeleted={() => router.replace("/invoices")} />
    </div>
  );
}
