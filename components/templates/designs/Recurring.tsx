import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

/** Cycle — lime band with a cycle motif, issue-to-due timeline, pill total. */
export default function Recurring({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#5E6A3A]";

  return (
    <div className={cn(PAGE, "flex-col font-sans text-[#0E1116]")}>
      <header className="relative overflow-hidden rounded-b-[44px] bg-[#EEF7CF] px-14 pb-12 pt-12">
        <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-10 -top-10 size-[260px]">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#C8F031" strokeWidth="26" strokeDasharray="300 140" />
          <path d="M168 56 l12 30 -32 -4z" fill="#0E1116" />
          <circle cx="100" cy="100" r="34" fill="none" stroke="#0E1116" strokeWidth="2" strokeDasharray="4 6" />
        </svg>
        <div className="relative flex items-center gap-3">
          <BrandMark business={b} className="size-11 rounded-xl" fallbackClass="bg-[#0E1116] text-[#C8F031]" />
          <div className="font-semibold">{b.name}</div>
        </div>
        <div className="relative mt-10 flex items-end gap-4">
          <div className="font-display text-[60px] font-extrabold leading-none tracking-[-0.04em]">{d.meta.title}</div>
          {d.subject && <span className="mb-2 rounded-full bg-[#0E1116] px-3 py-1 text-[12px] font-semibold text-[#C8F031]">{d.subject}</span>}
        </div>
        <div className="relative mt-2 font-mono text-[13px] text-[#3D4F00]">{invoice.number} · {d.order}</div>
      </header>

      <div className="flex flex-1 flex-col px-14 pb-12 pt-10">
        <section className="flex items-center gap-4 rounded-2xl border-2 border-[#0E1116] px-6 py-5">
          <div>
            <div className={label}>Issued</div>
            <div className="text-[15px] font-semibold">{d.date(invoice.issueDate)}</div>
          </div>
          <div className="relative h-[2px] flex-1 bg-[#0E1116]">
            <span className="absolute -top-[5px] left-0 size-3 rounded-full bg-[#C8F031] ring-2 ring-[#0E1116]" />
            <span className="absolute -top-[5px] right-0 size-3 rounded-full bg-[#0E1116]" />
          </div>
          <div className="text-right">
            <div className={label}>Due</div>
            <div className="text-[15px] font-semibold">{d.date(invoice.dueDate)}</div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-3 gap-8">
          <div>
            <div className={label}>Billed to</div>
            <div className="mt-1 font-semibold">{c.name}</div>
            <Lines lines={d.to} className="text-[#3A4150]" />
          </div>
          <div>
            <div className={label}>Client order</div>
            <div className="mt-1 font-mono font-semibold">{d.order}</div>
            {d.reference && (
              <>
                <div className={cn(label, "mt-3")}>Reference</div>
                <div className="font-mono font-semibold">{d.reference}</div>
              </>
            )}
          </div>
          <div>
            <div className={label}>From</div>
            <Lines lines={d.from} className="mt-1 text-[#3A4150]" />
          </div>
        </section>

        <div className="mt-10 space-y-0">
          <div className={cn(label, "flex justify-between border-b-2 border-[#0E1116] pb-2")}>
            <span>{d.meta.columns.desc}</span>
            <span>{d.meta.columns.amount}</span>
          </div>
          {d.rows.map((r, i) => (
            <div key={r.id} className="flex items-center justify-between border-b border-dotted border-[#B9C08F] py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-full bg-[#EEF7CF] font-mono text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="font-medium">{r.description}</div>
                  <div className="text-[12px] text-[#5B6070]">{r.qtyText} × {r.rateText}{r.details ? ` · ${r.details}` : ""}</div>
                </div>
              </div>
              <span className="font-mono font-medium">{r.amountText}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-6">
          <div className="space-y-1 text-[#5B6070]">
            <div>Subtotal <span className="ml-3 font-mono text-[#0E1116]">{d.money(invoice.subtotal)}</span></div>
            <div>Tax ({invoice.taxRate || 0}%) <span className="ml-3 font-mono text-[#0E1116]">{d.money(invoice.tax)}</span></div>
          </div>
          <div className="flex items-center gap-4 rounded-full bg-[#0E1116] py-3 pl-6 pr-3 text-white">
            <span className="text-[12px] uppercase tracking-[0.14em] text-[#B5BAC4]">{d.meta.totalLabel} ({invoice.currency})</span>
            <span className="rounded-full bg-[#C8F031] px-5 py-2 font-display text-[24px] font-extrabold text-[#0E1116]">{d.money(invoice.total)}</span>
          </div>
        </div>

        <section className="mt-10 grid grid-cols-2 gap-8 rounded-2xl bg-[#F7FAEA] p-6">
          <div>
            <div className={cn(label, "mb-2")}>How to pay</div>
            <PaymentLines invoice={invoice} labelClass="text-[#5E6A3A]" />
          </div>
          {invoice.notes && (
            <div>
              <div className={cn(label, "mb-2")}>Notes</div>
              <p className="whitespace-pre-line text-[#3A4150]">{invoice.notes}</p>
            </div>
          )}
        </section>

        <PoweredBy invoice={invoice} className="mt-auto pt-8 text-[#8A8F9C]" />
      </div>
    </div>
  );
}
