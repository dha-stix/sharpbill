import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const NAVY = "#14234B";

/** Blueprint — navy grid header, sky accents, due-date badge. */
export default function Proforma({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#5A6B94]";

  return (
    <div className={cn(PAGE, "flex-col font-sans text-[#14234B]")}>
      <header
        className="relative px-14 pb-10 pt-12 text-white"
        style={{
          backgroundColor: NAVY,
          backgroundImage:
            "linear-gradient(rgba(125,211,252,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BrandMark business={b} className="size-12 rounded-xl bg-white p-1" fallbackClass="bg-[#7DD3FC] text-[#14234B] text-lg p-0" />
            <div>
              <div className="font-semibold">{b.name}</div>
              <div className="text-[12px] text-[#B9C6E4]">{b.email}</div>
            </div>
          </div>
          <div className="rounded-full border border-[#7DD3FC] px-3 py-1 font-mono text-[11px] tracking-widest text-[#7DD3FC]">{d.order}</div>
        </div>
        <div className="mt-12 flex items-end justify-between gap-6">
          <div>
            <div className="font-display text-[52px] font-extrabold leading-none tracking-[-0.035em]">{d.meta.title}</div>
            <div className="mt-2 text-[#B9C6E4]">{d.subject || `For ${c.name}`}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[15px]">{invoice.number}</div>
            <div className="mt-2 inline-block rounded-md bg-[#7DD3FC] px-3 py-1.5 text-[12px] font-semibold text-[#14234B]">
              Due {d.date(invoice.dueDate)}
            </div>
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col px-14 py-10">
        <section className="grid grid-cols-[1.3fr_1.3fr_1fr] gap-8">
          <div>
            <div className={label}>Billed to</div>
            <div className="mt-1.5 font-semibold">{c.name}</div>
            <Lines lines={d.to} className="text-[#3B4A6B]" />
          </div>
          <div>
            <div className={label}>From</div>
            <div className="mt-1.5 font-semibold">{b.name}</div>
            <Lines lines={d.from} className="text-[#3B4A6B]" />
          </div>
          <div className="space-y-3">
            <div><div className={label}>Issued</div><div className="font-medium">{d.date(invoice.issueDate)}</div></div>
            {d.reference && <div><div className={label}>Reference</div><div className="font-mono">{d.reference}</div></div>}
          </div>
        </section>

        <table className="mt-10 w-full border-collapse overflow-hidden rounded-lg">
          <thead>
            <tr className="bg-[#EEF3FB] text-left text-[11px] font-semibold uppercase tracking-[0.12em]">
              <th className="rounded-l-lg px-4 py-3">{d.meta.columns.desc}</th>
              <th className="px-4 py-3 text-right">{d.meta.columns.qty}</th>
              <th className="px-4 py-3 text-right">{d.meta.columns.rate}</th>
              <th className="rounded-r-lg px-4 py-3 text-right">{d.meta.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => (
              <tr key={r.id} className="border-b border-dashed border-[#D3DCEE]">
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <span className="font-mono text-[11px] text-[#7DA0D6]">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="font-medium">{r.description}</div>
                      {r.details && <div className="text-[12px] text-[#5A6B94]">{r.details}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono">{r.qtyText}</td>
                <td className="px-4 py-4 text-right font-mono">{r.rateText}</td>
                <td className="px-4 py-4 text-right font-mono font-semibold">{r.amountText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 flex items-start justify-between gap-10">
          <div className="max-w-[340px] text-[12px] text-[#5A6B94]">
            {invoice.notes && (
              <>
                <div className={cn(label, "mb-1.5")}>Notes</div>
                <p className="whitespace-pre-line text-[#3B4A6B]">{invoice.notes}</p>
              </>
            )}
          </div>
          <div className="w-[300px] overflow-hidden rounded-xl text-white" style={{ backgroundColor: NAVY }}>
            <div className="space-y-2 px-5 pt-5 text-[#B9C6E4]">
              <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span>Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
            </div>
            <div className="mt-4 border-t border-white/15 px-5 py-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-[#7DD3FC]">{d.meta.totalLabel} ({invoice.currency})</div>
              <div className="font-display text-[32px] font-extrabold">{d.money(invoice.total)}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-[#D3DCEE] p-5">
          <div className={cn(label, "mb-2")}>Payment</div>
          <PaymentLines invoice={invoice} labelClass="text-[#5A6B94]" />
        </div>

        <PoweredBy invoice={invoice} className="mt-auto pt-8 text-[#8796B8]" />
      </div>
    </div>
  );
}
