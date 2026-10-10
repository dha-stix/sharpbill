"use client";

import Link from "next/link";
import { use } from "react";
import { EmptyState, PageLoader } from "@/components/ui/Bits";
import { useInvoice } from "@/hooks/useData";
import InvoiceEditor from "./InvoiceEditor";

/** Loads an invoice and opens it in the editor. Paid invoices are locked. */
export default function InvoiceEditView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { invoice, loading } = useInvoice(id);

  if (loading) return <PageLoader />;
  if (!invoice) return <EmptyState title="Invoice not found" body="It may have been deleted." action={<Link href="/invoices" className="btn btn-ink">Back to invoices</Link>} />;
  if (invoice.status === "PAID")
    return (
      <EmptyState
        title={`${invoice.number} is paid`}
        body="Paid invoices are locked so your records stay accurate. Mark it as unpaid first if you need to change it."
        action={<Link href={`/invoice/${invoice.id}`} className="btn btn-ink">Back to invoice</Link>}
      />
    );
  // Keyed by id so the form starts fresh for each invoice.
  return <InvoiceEditor key={invoice.id} existing={invoice} />;
}
