import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { Barcode, BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const PURPLE = "#4B2A9A";

/** Manifest — structured document layout with address cards, info strip and barcode. */
export default function Commercial({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10px] font-semibold uppercase tracking-[0.16em]";

  return (
    <div className={cn(PAGE, "flex-col font-sans text-[#1B1430]")}>
      <div className="h-2.5" style={{ backgroundColor: PURPLE }} />
      <div className="flex flex-1 flex-col px-12 pb-12 pt-10">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BrandMark business={b} className="size-12 rounded-lg" fallbackClass="bg-[#4B2A9A] text-white" />
            <div>
              <div className="text-[16px] font-semibold">{b.name}</div>
              <div className="text-[12px] text-[#6B6185]">{[b.email, b.phone].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn(label, "text-[#6B6185]")}>{d.meta.title}</div>
            <div className="font-display text-[30px] font-extrabold tracking-tight" style={{ color: PURPLE }}>{invoice.number}</div>
            <div className="mt-1 flex justify-end"><Barcode value={invoice.number} color="#1B1430" height={30} /></div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-3">
          {[
            { k: "From", name: b.name, lines: d.from },
            { k: "Bill to", name: c.name, lines: d.to },
          ].map((blk) => (
            <div key={blk.k} className="rounded-lg border border-[#DDD3F3] bg-[#FAF8FF] p-4">
              <div className={label} style={{ color: PURPLE }}>{blk.k}</div>
              <div className="mt-1.5 font-semibold">{blk.name}</div>
              <Lines lines={blk.lines} className="text-[12px] text-[#4A4166]" />
            </div>
          ))}
        </section>

        <section className="mt-3 grid grid-cols-4 overflow-hidden rounded-lg border border-[#DDD3F3]">
          {[
            ["Issue date", d.date(invoice.issueDate)],
            ["Due date", d.date(invoice.dueDate)],
            ["Client order", d.order],
            ["Reference", d.reference || "—"],
          ].map(([k, v], i) => (
            <div key={k} className={cn("px-4 py-3", i > 0 && "border-l border-[#DDD3F3]")}>
              <div className={cn(label, "text-[#6B6185]")}>{k}</div>
              <div className="mt-0.5 font-medium">{v}</div>
            </div>
          ))}
        </section>

        {d.subject && <div className="mt-8 font-display text-[20px] font-bold" style={{ color: PURPLE }}>{d.subject}</div>}

        <table className={cn("w-full border-collapse text-[12.5px]", d.subject ? "mt-4" : "mt-8")}>
          <thead>
            <tr className="text-left text-white" style={{ backgroundColor: PURPLE }}>
              <th className={cn(label, "rounded-l-md px-3 py-2.5")}>#</th>
              <th className={cn(label, "px-3 py-2.5")}>{d.meta.columns.desc}</th>
              <th className={cn(label, "px-3 py-2.5 text-right")}>{d.meta.columns.qty}</th>
              <th className={cn(label, "px-3 py-2.5 text-right")}>{d.meta.columns.rate}</th>
              <th className={cn(label, "rounded-r-md px-3 py-2.5 text-right")}>{d.meta.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={r.id} className="border-b border-[#ECE6F8]">
                <td className="px-3 py-3 font-mono text-[11.5px] text-[#6B6185]">{String(i + 1).padStart(2, "0")}</td>
                <td className="px-3 py-3">
                  <div className="font-medium">{r.description}</div>
                  {r.details && <div className="text-[11.5px] text-[#6B6185]">{r.details}</div>}
                </td>
                <td className="px-3 py-3 text-right font-mono">{r.qtyText}</td>
                <td className="px-3 py-3 text-right font-mono">{r.rateText}</td>
                <td className="px-3 py-3 text-right font-mono font-medium">{r.amountText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-between gap-8">
          <div className="max-w-[330px] text-[12px] text-[#4A4166]">
            {invoice.notes && (
              <>
                <div className={cn(label, "mb-1.5")} style={{ color: PURPLE }}>Notes</div>
                <p className="whitespace-pre-line">{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="w-[280px] space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-[#6B6185]">Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#6B6185]">Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
            <div className="flex items-baseline justify-between border-t-2 pt-2.5" style={{ borderColor: PURPLE }}>
              <span className="font-semibold">{d.meta.totalLabel} ({invoice.currency})</span>
              <span className="font-display text-[24px] font-extrabold" style={{ color: PURPLE }}>{d.money(invoice.total)}</span>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-lg bg-[#F3EEFF] p-4 text-[12.5px]">
          <div className={cn(label, "mb-2")} style={{ color: PURPLE }}>Payment</div>
          <PaymentLines invoice={invoice} labelClass="text-[#6B6185]" />
        </section>

        <PoweredBy invoice={invoice} className="mt-auto pt-8 text-[#9A90B8]" />
      </div>
    </div>
  );
}
