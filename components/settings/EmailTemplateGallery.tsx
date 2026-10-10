"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { EMAIL_VARIABLES } from "@/lib/constants";
import { EMAIL_TEMPLATES, previewHtml, type EmailTemplate } from "@/lib/email-templates";
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

const SETUP: [string, string][] = [
  ["Subject", "{{subject}}"],
  ["To email", "{{to_email}}"],
  ["Reply to", "{{reply_to}}"],
  ["CC (optional)", "{{cc_email}}"],
  ["Attachment", "Variable attachment · parameter invoice_pdf"],
  ["Attachment filename", "{{invoice_number}}.pdf · content type PDF"],
];

export default function EmailTemplateGallery() {
  const [open, setOpen] = useState<EmailTemplate | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const previews = useMemo(() => Object.fromEntries(EMAIL_TEMPLATES.map((t) => [t.id, previewHtml(t.html)])), []);

  return (
    <div className="flex flex-col gap-5">
      {/* EmailJS setup */}
      <div className="rounded-2xl bg-paper p-4">
        <div className="mb-3 text-sm font-semibold">In your EmailJS template, set:</div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {SETUP.map(([k, v]) => (
            <div key={k} className="flex flex-wrap items-baseline gap-x-2">
              <dt className="text-muted">{k}</dt>
              <dd className="font-mono text-[13px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[13px] text-muted">
          Add the two attachment rows in the template’s <strong className="text-ink">Attachments</strong> tab — without them EmailJS drops the PDF.
        </p>
        <p className="mt-2 text-[13px] text-muted">
          Then open <strong className="text-ink">Content → Edit content → Code editor</strong> and paste a design below. HTML variables use triple braces so EmailJS doesn’t escape them.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Available variables">
        {EMAIL_VARIABLES.text.map((v) => (
          <span key={v} className="rounded-md border border-line bg-paper-2 px-2 py-1 font-mono text-xs">{`{{${v}}}`}</span>
        ))}
        {EMAIL_VARIABLES.html.map((v) => (
          <span key={v} className="rounded-md border border-lime-deep/30 bg-lime-soft px-2 py-1 font-mono text-xs" title="HTML — use triple braces">{`{{{${v}}}}`}</span>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {EMAIL_TEMPLATES.map((t, i) => (
          <motion.article
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -5 }}
            className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
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
                  <span className="rounded-md bg-paper px-2 py-0.5 text-[11px] text-muted">Pairs with {t.pairsWith}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{t.description}</p>
              </div>
              <div className="mt-auto flex gap-2">
                <button type="button" className="btn btn-outline flex-1 !min-h-10 text-sm" onClick={() => setOpen(t)}>
                  <Icon name="eye" size={16} /> Preview
                </button>
                <CopyButton value={t.html} label="Copy HTML" className="flex-1 !min-h-10 text-sm" />
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
              <CopyButton value={open.html} label="Copy HTML" className="!bg-lime !border-lime" />
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
