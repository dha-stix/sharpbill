import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const ORANGE = "#C2410C";

/** Atelier — warm cream paper, serif display, numbered line items. */
export default function Milestone({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#9A6B4F]";

  return (
    <div className={cn(PAGE, "flex-col px-14 py-14 font-sans text-[#2B1A10]")} style={{ backgroundColor: "#FBF4EA" }}>
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <BrandMark business={b} className="size-12 rounded-full" fallbackClass="bg-[#2B1A10] text-[#FBF4EA]" />
          <div>
            <div className="font-semibold">{b.name}</div>
            <div className="text-[12px] text-[#9A6B4F]">{b.email}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={label}>{d.meta.title}</div>
          <div className="font-mono text-[14px]">{invoice.number}</div>
          <div className="font-mono text-[12px] text-[#9A6B4F]">{d.order}{d.reference ? ` · ${d.reference}` : ""}</div>
        </div>
      </header>

      <div className="mt-14">
        <div className="font-serif text-[22px] italic text-[#9A6B4F]">for {c.name}</div>
        <h1 className="font-serif text-[64px] leading-[0.95] tracking-[-0.02em]">{d.subject || d.meta.title}</h1>
      </div>


      <section className="mt-10 grid grid-cols-3 gap-8 border-y border-[#E6D6C0] py-5">
        <div><div className={label}>Client</div><div className="mt-1 font-semibold">{c.name}</div><Lines lines={d.to} className="text-[12px] text-[#6B4A36]" /></div>
        <div><div className={label}>Issued</div><div className="mt-1">{d.date(invoice.issueDate)}</div><div className={cn(label, "mt-3")}>Due</div><div>{d.date(invoice.dueDate)}</div></div>
        <div><div className={label}>From</div><Lines lines={d.from} className="mt-1 text-[12px] text-[#6B4A36]" /></div>
      </section>

      <div className="mt-8 space-y-3">
        {d.rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-[40px_1fr_150px_130px] items-center gap-4 rounded-2xl bg-white/70 px-5 py-4">
            <span className="font-serif text-[28px] italic leading-none" style={{ color: ORANGE }}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="font-medium">{r.description}</div>
              {r.details && <div className="text-[12px] text-[#9A6B4F]">{r.details}</div>}
            </div>
            <div className="text-right font-mono text-[12px] text-[#9A6B4F]">{r.qtyText} × {r.rateText}</div>
            <div className="text-right font-mono font-medium">{r.amountText}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-end justify-between gap-8">
        <div className="space-y-1 text-[#6B4A36]">
          <div>Subtotal <span className="ml-3 font-mono text-[#2B1A10]">{d.money(invoice.subtotal)}</span></div>
          <div>Tax ({invoice.taxRate || 0}%) <span className="ml-3 font-mono text-[#2B1A10]">{d.money(invoice.tax)}</span></div>
        </div>
        <div className="text-right">
          <div className={label}>{d.meta.totalLabel} ({invoice.currency})</div>
          <div className="font-serif text-[56px] leading-none" style={{ color: ORANGE }}>{d.money(invoice.total)}</div>
          <div className="ml-auto mt-2 h-[3px] w-24 rounded-full" style={{ backgroundColor: ORANGE }} />
        </div>
      </div>

      <section className="mt-10 grid grid-cols-2 gap-8 text-[12.5px]">
        <div>
          <div className={cn(label, "mb-2")}>Payment</div>
          <PaymentLines invoice={invoice} labelClass="text-[#9A6B4F]" />
        </div>
        {invoice.notes && (
          <div>
            <div className={cn(label, "mb-2")}>A note</div>
            <p className="whitespace-pre-line font-serif text-[16px] italic leading-snug text-[#6B4A36]">{invoice.notes}</p>
          </div>
        )}
      </section>

      <PoweredBy invoice={invoice} className="mt-auto border-t border-[#E6D6C0] pt-4 text-[#B08D74]" />
    </div>
  );
}
