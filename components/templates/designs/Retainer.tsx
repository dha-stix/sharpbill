import { cn } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { BrandMark, Lines, PAGE, PaymentLines, PoweredBy, prepareDoc } from "../parts";

const GREEN = "#0F3D2E";
const MINT = "#86EFAC";

/** Emerald — full-height green column holding the brand and amount due. */
export default function Retainer({ invoice }: { invoice: Invoice }) {
  const d = prepareDoc(invoice);
  const b = invoice.business;
  const c = invoice.client;
  const label = "text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#5E7A6E]";

  return (
    <div className={cn(PAGE, "flex-row font-sans text-[#10241C]")}>
      <aside className="flex w-[270px] shrink-0 flex-col px-9 py-12 text-white" style={{ backgroundColor: GREEN }}>
        <BrandMark business={b} className="size-14 rounded-2xl bg-white p-1" fallbackClass="text-[#0F3D2E] text-xl p-0 !bg-[#86EFAC]" />
        <div className="mt-6 font-semibold">{b.name}</div>
        <Lines lines={d.from} className="mt-1 text-[12px] leading-relaxed text-[#A7C7B9]" />
        <div className="mt-1 text-[12px] text-[#A7C7B9]">{b.email}</div>

        <div className="mt-auto">
          <div className="h-px w-full bg-white/15" />
          <div className="mt-6 text-[10.5px] uppercase tracking-[0.18em]" style={{ color: MINT }}>{d.meta.totalLabel} ({invoice.currency})</div>
          <div className="mt-1 font-display text-[34px] font-extrabold leading-tight">{d.money(invoice.total)}</div>
          <div className="mt-1 text-[12px] text-[#A7C7B9]">by {d.date(invoice.dueDate)}</div>
          <div className="mt-8 font-mono text-[11px] text-[#A7C7B9]">{invoice.number} · {d.order}</div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col px-12 py-12">
        <div className={label}>{d.order}</div>
        <h1 className="mt-1 font-serif text-[58px] leading-none">{d.meta.title}</h1>
        {d.subject && <div className="mt-2 font-serif text-[22px] italic text-[#2F6B55]">{d.subject}</div>}

        <section className="mt-10 grid grid-cols-3 gap-4">
          {[
            ["Issued", d.date(invoice.issueDate)],
            d.reference ? ["Reference", d.reference] : ["Client order", d.order],
            ["Due", d.date(invoice.dueDate)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-[#D6E6DE] px-4 py-3">
              <div className={label}>{k}</div>
              <div className="mt-0.5 font-medium">{v}</div>
            </div>
          ))}
        </section>

        <section className="mt-8">
          <div className={label}>Client</div>
          <div className="mt-1 text-[16px] font-semibold">{c.name}</div>
          <Lines lines={d.to} className="text-[#3E5A4E]" />
        </section>

        <table className="mt-8 w-full border-collapse">
          <thead>
            <tr className={cn(label, "text-left")}>
              <th className="border-b border-[#10241C] pb-2">{d.meta.columns.desc}</th>
              <th className="border-b border-[#10241C] pb-2 text-right">{d.meta.columns.qty}</th>
              <th className="border-b border-[#10241C] pb-2 text-right">{d.meta.columns.rate}</th>
              <th className="border-b border-[#10241C] pb-2 text-right">{d.meta.columns.amount}</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r) => (
              <tr key={r.id} className="border-b border-[#E3EEE8]">
                <td className="py-3.5 pr-3">
                  <div className="font-medium">{r.description}</div>
                  {r.details && <div className="text-[12px] text-[#5E7A6E]">{r.details}</div>}
                </td>
                <td className="py-3.5 text-right font-mono">{r.qtyText}</td>
                <td className="py-3.5 text-right font-mono">{r.rateText}</td>
                <td className="py-3.5 text-right font-mono font-medium">{r.amountText}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-5 w-[260px] space-y-2">
          <div className="flex justify-between"><span className="text-[#5E7A6E]">Subtotal</span><span className="font-mono">{d.money(invoice.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-[#5E7A6E]">Tax ({invoice.taxRate || 0}%)</span><span className="font-mono">{d.money(invoice.tax)}</span></div>
          <div className="flex justify-between rounded-lg px-3 py-2 font-semibold" style={{ backgroundColor: "#DCFCE7" }}><span>Total</span><span className="font-mono">{d.money(invoice.total)}</span></div>
        </div>

        {/* Stacked: this design's content column is too narrow to fit bank details beside the notes. */}
        <section className="mt-10 grid gap-6 text-[12.5px]">
          <div>
            <div className={cn(label, "mb-2")}>Payment</div>
            <PaymentLines invoice={invoice} labelClass="text-[#5E7A6E]" />
          </div>
          {invoice.notes && (
            <div>
              <div className={cn(label, "mb-2")}>Notes</div>
              <p className="whitespace-pre-line text-[#3E5A4E]">{invoice.notes}</p>
            </div>
          )}
        </section>

        <PoweredBy invoice={invoice} className="mt-auto pt-8 text-[#8BA79A]" />
      </div>
    </div>
  );
}
