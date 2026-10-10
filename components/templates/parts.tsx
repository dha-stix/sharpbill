import { APP_NAME } from "@/lib/constants";
import { addressLines, cn, formatDate, formatMoney } from "@/lib/format";
import { bankRows, formatOrderNumber, lineAmount } from "@/lib/invoice-utils";
import type { Invoice } from "@/lib/types";
import { TEMPLATES } from "./registry";

export { BrandMark } from "./BrandMark";

/** A4 at 96dpi */
export const PAGE = "relative flex w-[794px] min-h-[1123px] overflow-hidden bg-white text-[13px] leading-relaxed";

const withTaxId = (lines: string[], taxId?: string) => (taxId?.trim() ? [...lines, `Tax ID ${taxId.trim()}`] : lines);

/** Formats everything a template needs from an invoice so templates stay presentational. */
export function prepareDoc(invoice: Invoice) {
  const meta = TEMPLATES[invoice.template] ?? TEMPLATES.standard;
  const money = (n: number) => formatMoney(n, invoice.currency);
  const date = (s?: string) => formatDate(s);
  const rows = invoice.items.map((it) => ({
    ...it,
    qtyText: String(it.quantity ?? ""),
    rateText: formatMoney(it.rate, invoice.currency),
    amountText: money(lineAmount(it)),
  }));
  return {
    meta,
    money,
    date,
    rows,
    x: invoice.extra || {},
    /** Optional free-text subject, e.g. "October retainer" */
    subject: invoice.extra?.subject || "",
    reference: invoice.extra?.reference || "",
    order: formatOrderNumber(invoice.clientOrderNumber || 1),
    // Tax IDs travel with the address lines, so every design prints them whenever they are set.
    from: withTaxId(addressLines(invoice.business.address), invoice.business.taxId),
    to: withTaxId(addressLines(invoice.client.address), invoice.client.taxId),
  };
}

export function PaymentLines({ invoice, labelClass, valueClass }: { invoice: Invoice; labelClass?: string; valueClass?: string }) {
  const p = invoice.payment;
  if (p.type === "link")
    return p.link ? (
      <div>
        <div className={labelClass}>Pay online</div>
        <div className={cn("break-all underline underline-offset-2", valueClass)}>{p.link}</div>
      </div>
    ) : null;
  const rows = bankRows(p.bank);
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <span className={cn("whitespace-nowrap", labelClass)}>{k}</span>
          <span className={cn("min-w-0 break-words font-mono", valueClass)}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function PoweredBy({ className, invoice }: { className?: string; invoice: Invoice }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-[10.5px] tracking-wide", className)}>
      <span>
        {invoice.business.name} · {invoice.number}
      </span>
      <span className="inline-flex items-center gap-1.5">
        Generated with <strong className="font-display text-[12px] font-extrabold">{APP_NAME}</strong>
      </span>
    </div>
  );
}

export function Lines({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div className={className}>
      {lines.map((l) => (
        <div key={l}>{l}</div>
      ))}
    </div>
  );
}

/** Simple decorative barcode generated from a string (Commercial template). */
export function Barcode({ value, color = "#0E1116", height = 36 }: { value: string; color?: string; height?: number }) {
  const bars: number[] = [];
  for (const ch of value.repeat(3)) bars.push((ch.charCodeAt(0) % 3) + 1);
  let x = 0;
  return (
    <svg height={height} width={bars.length * 4} aria-hidden="true">
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={height} fill={color} /> : null;
        x += w + 1;
        return rect;
      })}
    </svg>
  );
}
