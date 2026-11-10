"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { EMAIL_TEMPLATES, emailDesign, previewHtml, type EmailTemplate } from "@/lib/email-templates";
import { cn } from "@/lib/format";

const EMAIL_WIDTH = 680;

/** Scaled, non-interactive preview of an email. */
function EmailThumb({ html, scale = 0.5, height = 300 }: { html: string; scale?: number; height?: number }) {
  return (
    <div className="mx-auto overflow-hidden" style={{ width: EMAIL_WIDTH * scale, height }}>
      <iframe
        title="Email preview"
        srcDoc={html}
        sandbox=""
        tabIndex={-1}
        className="pointer-events-none border-0"
        style={{ width: EMAIL_WIDTH, height: height / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
}

/** The six invoice email designs: preview any of them and choose the one your invoices are sent with. */
export default function EmailTemplateGallery({ selected, onSelect }: { selected?: string; onSelect: (id: string) => void }) {
  const current = emailDesign(selected).id;
  const [open, setOpen] = useState<EmailTemplate | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const previews = useMemo(() => Object.fromEntries(EMAIL_TEMPLATES.map((t) => [t.id, previewHtml(t.html)])), []);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EMAIL_TEMPLATES.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -5 }}
            className={cn("flex flex-col overflow-hidden rounded-2xl border bg-white", t.id === current ? "border-ink ring-2 ring-ink" : "border-line")}
          >
            <button type="button" onClick={() => setOpen(t)} className="group relative block pt-4" style={{ background: t.swatch.bg }} aria-label={`Preview ${t.name} email`}>
              <EmailThumb html={previews[t.id]} scale={0.42} height={260} />
              <span className="absolute inset-0 grid place-items-center bg-ink/0 opacity-0 transition group-hover:bg-ink/35 group-hover:opacity-100">
                <span className="btn btn-lime !min-h-10 text-sm"><Icon name="eye" size={16} /> Preview</span>
              </span>
            </button>
            <div className="flex flex-1 flex-col gap-3 border-t border-line p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold">{t.name}</h3>
                  {t.id === current ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold text-lime"><Icon name="check" size={12} strokeWidth={3} /> In use</span>
                  ) : (
                    <span className="rounded-md bg-paper px-2 py-0.5 text-[11px] text-muted">Pairs with {t.pairsWith}</span>
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
              </div>
              <div className="mt-auto flex gap-2">
                <button type="button" className="btn btn-outline flex-1 !min-h-10 text-sm" onClick={() => setOpen(t)}>
                  <Icon name="eye" size={16} /> Preview
                </button>
                <button type="button" disabled={t.id === current} className="btn btn-ink flex-1 !min-h-10 text-sm" onClick={() => onSelect(t.id)}>
                  {t.id === current ? "Selected" : "Use this design"}
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `${open.name} email` : ""}
        subtitle="Invoice delivery · sample data shown"
        className="!max-w-3xl"
        footer={
          open && (
            <>
              <div role="tablist" aria-label="Preview width" className="flex gap-1 rounded-xl border border-line bg-white p-1">
                {(["desktop", "mobile"] as const).map((d) => (
                  <button
                    key={d}
                    role="tab"
                    aria-selected={device === d}
                    onClick={() => setDevice(d)}
                    className={cn("min-h-9 rounded-lg px-3 text-sm capitalize", device === d ? "bg-ink text-white" : "text-slate")}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={open.id === current}
                className="btn btn-lime"
                onClick={() => {
                  onSelect(open.id);
                  setOpen(null);
                }}
              >
                {open.id === current ? "In use" : "Use this design"}
              </button>
            </>
          )
        }
      >
        {open && (
          <div className="flex justify-center overflow-hidden rounded-xl bg-paper py-4">
            <motion.iframe
              key={device}
              title={`${open.name} email preview`}
              srcDoc={previews[open.id]}
              sandbox=""
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[62vh] max-w-full rounded-lg border-0 bg-white shadow-float"
              style={{ width: device === "desktop" ? EMAIL_WIDTH : 375 }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
