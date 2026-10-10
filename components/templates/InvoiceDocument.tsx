import { forwardRef, type ComponentType } from "react";
import type { Invoice, TemplateId } from "@/lib/types";
import Commercial from "./designs/Commercial";
import CreditNote from "./designs/CreditNote";
import Hourly from "./designs/Hourly";
import Milestone from "./designs/Milestone";
import Proforma from "./designs/Proforma";
import Recurring from "./designs/Recurring";
import Retainer from "./designs/Retainer";
import Standard from "./designs/Standard";

const DESIGNS: Record<TemplateId, ComponentType<{ invoice: Invoice }>> = {
  standard: Standard,
  proforma: Proforma,
  hourly: Hourly,
  recurring: Recurring,
  milestone: Milestone,
  retainer: Retainer,
  commercial: Commercial,
  credit: CreditNote,
};

/** Renders an invoice in its template at full A4 size (794px wide). The ref is used for PDF capture. */
const InvoiceDocument = forwardRef<HTMLDivElement, { invoice: Invoice }>(function InvoiceDocument({ invoice }, ref) {
  const Design = DESIGNS[invoice.template] ?? Standard;
  return (
    <div ref={ref} className="w-[794px] bg-white">
      <Design invoice={invoice} />
    </div>
  );
});

export default InvoiceDocument;
