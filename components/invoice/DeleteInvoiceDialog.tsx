"use client";

import { useState } from "react";
import { Spinner, StatusBadge } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { deleteInvoice } from "@/lib/firebase-actions";
import { formatMoney } from "@/lib/format";
import { effectiveStatus } from "@/lib/invoice-utils";
import type { Invoice } from "@/lib/types";

/** What deleting means for an invoice in each state. */
function consequence(inv: Invoice) {
  const status = effectiveStatus(inv);
  if (status === "PAID") return `This invoice is marked paid. Deleting it removes ${formatMoney(inv.total, inv.currency)} from your collected revenue and from the billed total for ${inv.client.name}.`;
  if (status === "SENT" || status === "OVERDUE") return `This invoice was already sent to ${inv.client.name} — they keep the copy they received, but it disappears from your records and outstanding totals.`;
  return "This invoice hasn’t been sent yet. It will be removed from your records.";
}

/**
 * Confirmation pop-up for deleting an invoice (any status).
 * Shared by the invoice page and the invoices list.
 */
export default function DeleteInvoiceDialog({ invoice, onClose, onDeleted }: { invoice: Invoice | null; onClose: () => void; onDeleted?: (invoice: Invoice) => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!invoice) return;
    setBusy(true);
    try {
      await deleteInvoice(invoice.id);
      toast(`${invoice.number} deleted`);
      onDeleted?.(invoice);
      onClose();
    } catch (e) {
      toast((e as Error).message || "Could not delete the invoice.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!invoice}
      onClose={busy ? () => {} : onClose}
      title={invoice ? `Delete ${invoice.number}?` : ""}
      subtitle="This can’t be undone"
      className="!max-w-md"
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={busy}>Keep invoice</button>
          <button type="button" className="btn bg-danger text-white hover:bg-[#8A1F17]" onClick={confirm} disabled={busy}>
            {busy ? <Spinner /> : <Icon name="trash" size={16} />} Delete invoice
          </button>
        </>
      }
    >
      {invoice && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper p-4">
            <div className="min-w-0">
              <div className="font-mono font-medium">{invoice.number}</div>
              <div className="truncate text-sm text-muted">{invoice.client.name}</div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="font-mono font-medium">{formatMoney(invoice.total, invoice.currency)}</span>
              <StatusBadge status={effectiveStatus(invoice)} />
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-slate">{consequence(invoice)}</p>
          <p className="text-[13px] text-muted">The number {invoice.number} won’t be reused — your next invoice continues the sequence.</p>
        </div>
      )}
    </Modal>
  );
}
