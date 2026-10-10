import { BANK_FIELDS } from "./constants";
import { daysUntil, padNumber } from "./format";
import type { BankDetails, Invoice, InvoiceStatus, LineItem, TemplateId } from "./types";

export function lineAmount(item: LineItem) {
  return (Number(item.quantity) || 0) * (Number(item.rate) || 0);
}

export function computeTotals(items: LineItem[], taxRate = 0, shipping = 0, template?: TemplateId) {
  const subtotal = items.reduce((sum, it) => sum + lineAmount(it), 0);
  const tax = (subtotal * (Number(taxRate) || 0)) / 100;
  const total = subtotal + tax + (Number(shipping) || 0);
  // Credit notes are stored as positive values and rendered as credits.
  void template;
  return { subtotal, tax, total };
}

export function formatInvoiceNumber(prefix: string, seq: number) {
  return `${prefix || "INV-"}${padNumber(seq)}`;
}

export function formatOrderNumber(n: number) {
  return `#${padNumber(n)}`;
}

/** SENT invoices past their due date are shown as OVERDUE. */
export function effectiveStatus(inv: Pick<Invoice, "status" | "dueDate">): InvoiceStatus {
  if (inv.status === "SENT" && inv.dueDate && daysUntil(inv.dueDate) < 0) return "OVERDUE";
  return inv.status;
}

/** Number of existing invoices per client id (deleted invoices are not counted). */
export function countByClient(invoices: Pick<Invoice, "clientId">[]) {
  const counts: Record<string, number> = {};
  for (const i of invoices) counts[i.clientId] = (counts[i.clientId] || 0) + 1;
  return counts;
}

export function dueLabel(inv: Pick<Invoice, "status" | "dueDate">) {
  if (inv.status === "PAID") return "Paid in full";
  const d = daysUntil(inv.dueDate);
  if (d === 0) return "Due today";
  if (d > 0) return `Due in ${d} day${d === 1 ? "" : "s"}`;
  return `${Math.abs(d)} day${d === -1 ? "" : "s"} overdue`;
}

/** The filled-in bank details as [label, value] rows. Older invoices may be missing newer fields. */
export function bankRows(bank: Partial<BankDetails> | undefined): [string, string][] {
  return BANK_FIELDS.flatMap(({ key, label }) => {
    const value = bank?.[key]?.trim();
    return value ? [[label, value] as [string, string]] : [];
  });
}

/** Bank details as plain text, one per line, for copying. */
export const bankText = (bank: Partial<BankDetails> | undefined) => bankRows(bank).map(([k, v]) => `${k}: ${v}`).join("\n");
