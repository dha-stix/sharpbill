import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

/** Monolith — ink and lime, oversized title, hard rule, lime total bar. */
export default function Standard({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5B6070]";

  return (
    <div className={cn(PAGE, "flex-col px-14 py-14 font-sans text-[#0E1116]")}>
      <header className="flex items-start justify-between gap-10">
        <div className="flex flex-col gap-5">
          <BrandMark business={b} className="size-14 rounded-2xl" fallbackClass="bg-[#0E1116] text-[#C8F031] text-xl" />
          <div className="text-[#3A4150]">
            <div className="text-[16px] font-semibold text-[#0E1116]">{b.name}</div>
            <Lines lines={d.from} />
            <div>{[b.email, b.phone].filter(Boolean).join(" · ")}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-[68px] font-extrabold leading-[0.85] tracking-[-0.045em]">{d.meta.title}</div>
          <div className="mt-4 font-mono text-[15px]">{invoice.number}</div>
          <div className="text-[12px] text-[#5B6070]">
            Order {d.order}
            {d.reference ? ` · Ref ${d.reference}` : ""}
          </div>
        </div>
      </header>

      <section className="mt-12 grid grid-cols-[1.6fr_1fr_1fr] gap-6 border-y border-[#E2E2DA] border-t-[3px] border-t-[#0E1116] py-5">
        <div>
          <div className={label}>Billed to</div>
          <div className="mt-1.5 font-semibold">{c.name}</div>
          <Lines lines={d.to} className="text-[#3A4150]" />
        </div>
        <div>
          <div className={label}>Issued</div>
          <div className="mt-1.5 font-medium">{d.date(invoice.issueDate)}</div>
        </div>
        <div>
          <div className={label}>Due</div>
          <div className="mt-1.5 font-medium">{d.date(invoice.dueDate)}</div>
        </div>
      </section>

      {d.subject && <div className="mt-8 font-display text-[22px] font-bold tracking-tight">{d.subject}</div>}

      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className={cn(label, "text-left")}>
            <th className="pb-3 font-semibold">{d.meta.columns.desc}</th>
            <th className="pb-3 text-right font-semibold">{d.meta.columns.qty}</th>
            <th className="pb-3 text-right font-semibold">{d.meta.columns.rate}</th>
            <th className="pb-3 text-right font-semibold">{d.meta.columns.amount}</th>
          </tr>
        </thead>
        <tbody>
          {d.rows.map((r) => (
            <tr key={r.id} className="border-t border-[#EDEDE6] align-top">
              <td className="py-4 pr-4">
                <div className="font-medium">{r.description}</div>
                {r.details && <div className="text-[12px] text-[#5B6070]">{r.details}</div>}
              </td>
              <td className="py-4 text-right font-mono">{r.qtyText}</td>
              <td className="py-4 text-right font-mono">{r.rateText}</td>
              <td className="py-4 text-right font-mono font-medium">{r.amountText}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-[320px] space-y-2.5">
          <div className="flex justify-between"><span className="text-[#5B6070]">Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#5B6070]">Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
          <div className="-mx-4 mt-3 flex items-baseline justify-between rounded-xl bg-[#C8F031] px-4 py-3.5">
            <span className="font-semibold">{d.meta.totalLabel} ({invoice.currency})</span>
            <span className="font-display text-[28px] font-extrabold tracking-tight">{d.money(invoice.total)}</span>
          </div>
        </div>
      </div>

      <section className="mt-12 grid grid-cols-2 gap-10">
        <div>
          <div className={cn(label, "mb-2")}>Payment</div>
          <PaymentLines invoice={invoice} labelClass="text-[#5B6070]" />
        </div>
        {invoice.notes && (
          <div>
            <div className={cn(label, "mb-2")}>Notes</div>
            <p className="whitespace-pre-line text-[#3A4150]">{invoice.notes}</p>
          </div>
        )}
      </section>

      <PoweredBy invoice={invoice} className="mt-auto border-t border-[#EDEDE6] pt-4 text-[#8A8F9C]" />
    </div>
  );
}
