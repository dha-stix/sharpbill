import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const BLUE = "#1D3A8A";

/** Ledger — vertical spine, summary tiles, numbers-first table with quantity bars. */
export default function Hourly({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const maxQty = Math.max(1, ...invoice.items.map((it) => Number(it.quantity) || 0));
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5B6B99]";

  return (
    <div className={cn(PAGE, "flex-row font-sans text-[#111A3A]")}>
      <aside className="flex w-[64px] shrink-0 items-center justify-center text-white" style={{ backgroundColor: BLUE }}>
        <div className="rotate-180 font-mono text-[12px] tracking-[0.4em] [writing-mode:vertical-rl]">INVOICE · {invoice.number}</div>
      </aside>

      <div className="flex flex-1 flex-col px-12 py-12">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BrandMark business={b} className="size-12 rounded-full" fallbackClass="bg-[#EAF0FF] text-[#1D3A8A]" />
            <div className="leading-snug">
              <div className="font-semibold">{b.name}</div>
              <div className="text-[12px] text-[#5B6B99]">{[b.email, b.phone].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[38px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: BLUE }}>{d.meta.title}</div>
            <div className="mt-2 font-mono text-[13px]">{invoice.number} · {d.order}</div>
          </div>
        </header>

        <section className="mt-10 grid grid-cols-3 gap-6 border-b border-[#DCE4F7] pb-8">
          <div>
            <div className={label}>Client</div>
            <div className="mt-1 font-semibold">{c.name}</div>
            <Lines lines={d.to} className="text-[12px] text-[#4A5680]" />
          </div>
          <div>
            <div className={label}>From</div>
            <Lines lines={d.from} className="mt-1 text-[12px] text-[#4A5680]" />
          </div>
          <div className="space-y-2">
            {d.subject && <div><div className={label}>Subject</div><div className="font-medium">{d.subject}</div></div>}
            {d.reference && <div><div className={label}>Reference</div><div className="font-mono">{d.reference}</div></div>}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-3 gap-4">
          {[
            ["Issued", d.date(invoice.issueDate)],
            ["Due", d.date(invoice.dueDate)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[#F3F6FF] px-5 py-4">
              <div className={label}>{k}</div>
              <div className="mt-1 font-mono text-[18px] font-medium">{v}</div>
            </div>
          ))}
          <div className="rounded-xl px-5 py-4 text-white" style={{ backgroundColor: BLUE }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#B8C7F2]">{d.meta.totalLabel}</div>
            <div className="mt-1 font-mono text-[18px] font-medium">{d.money(invoice.total)}</div>
          </div>
        </section>

        <table className="mt-8 w-full border-collapse font-mono text-[12.5px]">
          <thead>
            <tr className="border-b-2 text-left font-sans text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5B6B99]" style={{ borderColor: BLUE }}>
              <th className="py-2.5 pl-2 pr-3">#</th>
              <th className="py-2.5 pr-3">{d.meta.columns.desc}</th>
              <th className="py-2.5 pr-3 text-right">{d.meta.columns.qty}</th>
              <th className="py-2.5 pr-3 text-right">{d.meta.columns.rate}</th>
              <th className="py-2.5 pr-2 text-right">{d.meta.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-[#F7F9FF]" : ""}>
                <td className="py-3 pl-2 pr-3 text-[#5B6B99]">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-3 pr-3 font-sans">
                  <div className="font-medium">{r.description}</div>
                  {r.details && <div className="text-[11.5px] text-[#5B6B99]">{r.details}</div>}
                </td>
                <td className="py-3 pr-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="h-1.5 rounded-full bg-[#C7D4F7]" style={{ width: `${Math.max(6, ((Number(r.quantity) || 0) / maxQty) * 56)}px` }} />
                    {r.qtyText}
                  </div>
                </td>
                <td className="py-3 pr-3 text-right">{r.rateText}</td>
                <td className="py-3 pr-2 text-right font-medium">{r.amountText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-[280px] space-y-2 text-[13px]">
          <div className="flex justify-between"><span className="text-[#5B6B99]">Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#5B6B99]">Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
          <div className="flex justify-between border-t-2 pt-2 text-[16px] font-semibold" style={{ borderColor: BLUE }}><span>Total ({invoice.currency})</span><span className="font-mono">{d.money(invoice.total)}</span></div>
        </div>

        <section className="mt-10 grid grid-cols-2 gap-8 text-[12.5px]">
          <div>
            <div className={cn(label, "mb-2")}>Payment</div>
            <PaymentLines invoice={invoice} labelClass="text-[#5B6B99]" />
          </div>
          {invoice.notes && (
            <div>
              <div className={cn(label, "mb-2")}>Notes</div>
              <p className="whitespace-pre-line text-[#4A5680]">{invoice.notes}</p>
            </div>
          )}
        </section>

        <PoweredBy invoice={invoice} className="mt-auto pt-8 text-[#8D9AC2]" />
      </div>
    </div>
  );
}
