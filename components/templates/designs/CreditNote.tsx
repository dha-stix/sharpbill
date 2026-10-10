import { cn } from "@/lib/format";
import { effectiveStatus } from "@/lib/invoice-utils";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const CORAL = "#B93A26";

/** Counterfoil — ticket stub with perforation and a rubber status stamp. */
export default function CreditNote({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const stamp = effectiveStatus(invoice) === "PAID" ? "PAID" : "DUE";
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#8A4B3F]";

  return (
    <div className={cn(PAGE, "flex-col font-sans text-[#2A120C]")}>
      {/* stub */}
      <div className="relative bg-[#FFEDE8] px-14 pb-9 pt-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <BrandMark business={b} className="size-11 rounded-xl" fallbackClass="bg-[#B93A26] text-white" />
            <div>
              <div className="font-semibold">{b.name}</div>
              <div className="text-[12px] text-[#8A4B3F]">{b.email}</div>
            </div>
          </div>
          <div className="text-right font-mono text-[12px] text-[#8A4B3F]">
            <div>{invoice.number}</div>
            <div>{d.date(invoice.issueDate)}</div>
          </div>
        </div>
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-[60px] font-extrabold leading-none tracking-[-0.04em]" style={{ color: CORAL }}>{d.meta.title}</h1>
            {d.subject && <div className="mt-2 text-[15px] font-medium">{d.subject}</div>}
          </div>
          <div className="text-right">
            <div className={label}>Due date</div>
            <div className="font-mono text-[18px] font-medium">{d.date(invoice.dueDate)}</div>
          </div>
        </div>
        {/* perforation */}
        <div className="absolute inset-x-0 -bottom-3 flex items-center">
          <span className="size-6 -translate-x-3 rounded-full bg-white" />
          <span className="h-0 flex-1 border-t-2 border-dashed border-[#EBB3A6]" />
          <span className="size-6 translate-x-3 rounded-full bg-white" />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-14 pb-12 pt-12">
        <div aria-hidden="true" className="absolute right-14 top-10 rotate-[-12deg] rounded-xl border-[4px] px-6 py-2 font-display text-[34px] font-extrabold tracking-[0.2em] opacity-80" style={{ borderColor: CORAL, color: CORAL }}>
          {stamp}
        </div>

        <section className="grid grid-cols-2 gap-8 pr-48">
          <div>
            <div className={label}>Billed to</div>
            <div className="mt-1 font-semibold">{c.name}</div>
            <Lines lines={d.to} className="text-[#5C2B22]" />
          </div>
          <div>
            <div className={label}>From</div>
            <Lines lines={d.from} className="mt-1 text-[#5C2B22]" />
            <div className="mt-2 font-mono text-[12px] text-[#8A4B3F]">{d.order}{d.reference ? ` · ${d.reference}` : ""}</div>
          </div>
        </section>

        <table className="mt-10 w-full border-collapse">
          <thead>
            <tr className={cn(label, "text-left")}>
              <th className="border-b-2 pb-2" style={{ borderColor: CORAL }}>{d.meta.columns.desc}</th>
              <th className="border-b-2 pb-2 text-right" style={{ borderColor: CORAL }}>{d.meta.columns.qty}</th>
              <th className="border-b-2 pb-2 text-right" style={{ borderColor: CORAL }}>{d.meta.columns.rate}</th>
              <th className="border-b-2 pb-2 text-right" style={{ borderColor: CORAL }}>{d.meta.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.id} className="border-b border-[#F4D9D2]">
                <td className="py-3.5 pr-3">
                  <div className="font-medium">{r.description}</div>
                  {r.details && <div className="text-[12px] text-[#8A4B3F]">{r.details}</div>}
                </td>
                <td className="py-3.5 text-right font-mono">{r.qtyText}</td>
                <td className="py-3.5 text-right font-mono">{r.rateText}</td>
                <td className="py-3.5 text-right font-mono font-medium">{r.amountText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-[320px] space-y-2">
            <div className="flex justify-between"><span className="text-[#8A4B3F]">Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#8A4B3F]">Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
            <div className="mt-2 flex items-baseline justify-between rounded-xl px-4 py-3 text-white" style={{ backgroundColor: CORAL }}>
              <span className="font-semibold">{d.meta.totalLabel} ({invoice.currency})</span>
              <span className="font-display text-[28px] font-extrabold">{d.money(invoice.total)}</span>
            </div>
          </div>
        </div>

        <section className="mt-10 grid grid-cols-2 gap-8 text-[12.5px]">
          <div>
            <div className={cn(label, "mb-2")}>Payment</div>
            <PaymentLines invoice={invoice} labelClass="text-[#8A4B3F]" />
          </div>
          {invoice.notes && (
            <div>
              <div className={cn(label, "mb-2")}>Notes</div>
              <p className="whitespace-pre-line text-[#5C2B22]">{invoice.notes}</p>
            </div>
          )}
        </section>

        <PoweredBy invoice={invoice} className="mt-auto border-t border-[#F4D9D2] pt-4 text-[#C08A7E]" />
      </div>
    </div>
  );
}
