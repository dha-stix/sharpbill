"use client";

import { forwardRef, useCallback, useRef } from "react";
import InvoiceDocument from "@/components/templates/InvoiceDocument";
import { renderInvoicePdf, type PdfPreset } from "@/lib/pdf";
import type { Invoice } from "@/lib/types";

/** Waits for the off-screen invoice to render. Browsers pause animation frames in background tabs, so a timer backs it up. */
const nextFrame = () =>
  new Promise<void>((r) => {
    requestAnimationFrame(() => requestAnimationFrame(() => r()));
    setTimeout(r, 150);
  });

/** Full-size invoice rendered off-screen so it can be captured into a PDF. */
export const OffscreenDocument = forwardRef<HTMLDivElement, { invoice: Invoice | null }>(function OffscreenDocument({ invoice }, ref) {
  if (!invoice) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0">
      <InvoiceDocument ref={ref} invoice={invoice} />
    </div>
  );
});

/** Returns a ref for <OffscreenDocument> and a function that turns it into a PDF. */
export function useInvoicePdf() {
  const ref = useRef<HTMLDivElement>(null);
  const make = useCallback(async (fileName: string, preset: PdfPreset = "print") => {
    await nextFrame();
    if (!ref.current) throw new Error("Invoice is not ready yet.");
    return renderInvoicePdf(ref.current, fileName, preset);
  }, []);
  return { ref, make };
}
