"use client";

import { useEffect, useRef, useState } from "react";
import type { Invoice } from "@/lib/types";
import InvoiceDocument from "./InvoiceDocument";

const A4_W = 794;

/**
 * Shows an A4 invoice scaled to fit its container width — used for live
 * previews, the invoice detail page and template thumbnails.
 */
export default function ScaledDocument({ invoice, maxScale = 1, className }: { invoice: Invoice; maxScale?: number; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    const doc = inner.current;
    if (!el || !doc) return;
    const update = () => {
      const s = Math.min(maxScale, el.clientWidth / A4_W);
      setScale(s);
      setHeight(doc.offsetHeight * s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    ro.observe(doc);
    return () => ro.disconnect();
  }, [maxScale]);

  return (
    <div ref={wrap} className={className} style={{ height: height || undefined }}>
      <div ref={inner} style={{ width: A4_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <InvoiceDocument invoice={invoice} />
      </div>
    </div>
  );
}
