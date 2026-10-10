"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Input, Spinner, Textarea } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { defaultEmailMessage, defaultEmailSubject, emailJsErrorMessage, hasEmailJsKeys, isEmailJsReady, isVariablesTooLarge, PAID_PLAN_MESSAGE, paysByLink, sendInvoiceEmail } from "@/lib/email";
import type { InvoicePdf, PdfPreset } from "@/lib/pdf";
import { saveEmailJsSettings, updateInvoiceStatus, uploadInvoicePdf } from "@/lib/firebase-actions";
import { formatMoney } from "@/lib/format";
import type { Invoice } from "@/lib/types";

type MakePdf = (fileName: string, preset?: PdfPreset) => Promise<InvoicePdf>;

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Email pop-up: recipient pre-filled from the client, editable subject/body,
 * PDF generated and attached on send via the user's EmailJS account.
 */
export default function SendInvoiceModal({
  invoice,
  open,
  onClose,
  makePdf,
  onSent,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  makePdf: MakePdf;
  onSent?: () => void;
}) {
  const [sending, setSending] = useState(false);
  if (!invoice) return null;
  return (
    <Modal
      open={open}
      onClose={sending ? () => {} : onClose}
      title="Send invoice"
      subtitle={<><span className="font-mono">{invoice.number}</span> · {formatMoney(invoice.total, invoice.currency)} · {invoice.client.name}</>}
    >
      {/* Mounted only while open, so every opening starts from a fresh draft. */}
      <Composer invoice={invoice} onClose={onClose} makePdf={makePdf} onSent={onSent} onSending={setSending} />
    </Modal>
  );
}

function Composer({ invoice, onClose, makePdf, onSent, onSending }: { invoice: Invoice; onClose: () => void; makePdf: MakePdf; onSent?: () => void; onSending: (b: boolean) => void }) {
  const { profile } = useAuth();
  const toast = useToast();
  const [to, setTo] = useState(invoice.client.email);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(() => defaultEmailSubject(invoice));
  const [message, setMessage] = useState(() => defaultEmailMessage(invoice));
  // Set when EmailJS refuses the email because the account is on the Free plan.
  const [needsPaidPlan, setNeedsPaidPlan] = useState(false);
  const [phase, setPhase] = useState<"compose" | "sending" | "sent">("compose");
  const [pdf, setPdf] = useState<InvoicePdf | null>(null);
  const [pdfError, setPdfError] = useState("");
  const ready = isEmailJsReady(profile?.emailjs);

  // Build the email-sized PDF as soon as the pop-up opens, so Send doesn't have to wait for it.
  useEffect(() => {
    let alive = true;
    makePdf(invoice.number, "email")
      .then((p) => alive && setPdf(p))
      .catch((e: Error) => alive && setPdfError(e.message || "Could not create the PDF."));
    return () => {
      alive = false;
    };
  }, [makePdf, invoice.number]);

  async function send() {
    if (!profile) return;
    setPhase("sending");
    onSending(true);
    try {
      // Invoices are always sent with the PDF attached.
      const file = pdf ?? (await makePdf(invoice.number, "email"));
      // Bank-transfer invoices get a "Download invoice" button, which needs the PDF stored online.
      let downloadUrl: string | undefined;
      if (!paysByLink(invoice)) {
        try {
          downloadUrl = await uploadInvoicePdf(invoice.id, invoice.number, file.blob);
        } catch {
          throw new Error("Couldn’t create the “Download invoice” link, so the email was not sent. Check that Firebase Storage is enabled and its rules are deployed, then try again.");
        }
      }
      await sendInvoiceEmail({ settings: profile.emailjs, invoice, to, cc, subject, message, pdfDataUrl: file.dataUrl, downloadUrl });
      if (invoice.status !== "PAID") await updateInvoiceStatus(invoice.id, "SENT");
      setPhase("sent");
      onSent?.();
    } catch (err) {
      if (isVariablesTooLarge(err)) {
        // EmailJS didn't take the PDF as an attachment (template setup or Free plan): explain, and require the keys to be verified again.
        setNeedsPaidPlan(true);
        saveEmailJsSettings({ ...profile.emailjs, verifiedKeys: "" }).catch(() => {});
        setPhase("compose");
        return;
      }
      // EmailJS failures carry a status code; anything else is one of our own messages.
      const text = typeof (err as { status?: number })?.status === "number" ? emailJsErrorMessage(err) : (err as Error)?.message || "Email failed to send.";
      toast(text, "error");
      setPhase("compose");
    } finally {
      onSending(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "sent" ? (
        <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 py-8 text-center">
          <motion.span className="grid size-20 place-items-center rounded-full bg-lime" initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0E1116" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <motion.path d="M5 12.5 10 17 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
            </svg>
          </motion.span>
          <h3 className="font-display text-2xl font-extrabold">Invoice sent</h3>
          <p className="max-w-sm text-muted">
            {invoice.number} is on its way to <strong className="text-ink">{to}</strong> and has been marked <strong className="text-[#1D3FA8]">SENT</strong>.
          </p>
          <button className="btn btn-ink" onClick={onClose}>Done</button>
        </motion.div>
      ) : (
        <motion.div key="compose" exit={{ opacity: 0 }} className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="To" type="email" value={to} onChange={(e) => setTo(e.target.value)} />
            <Input label="CC" type="email" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Optional" />
          </div>
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea label="Message" rows={8} value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className={`flex items-center gap-3 rounded-2xl p-3 ${pdfError ? "bg-[#FBE6E4]" : "bg-paper"}`}>
            <span className="grid h-12 w-10 shrink-0 place-items-center rounded-md bg-ink font-mono text-[11px] font-bold text-lime">PDF</span>
            <div className="min-w-0 flex-1 text-[13px]">
              <div className="text-sm font-semibold text-ink">{invoice.number}.pdf</div>
              <div className={pdfError ? "text-danger" : "text-muted"}>
                {pdfError ? pdfError : !pdf ? "Preparing the PDF…" : `${kb(pdf.encodedBytes)} · attached to the email · button: “${paysByLink(invoice) ? "Pay now" : "Download invoice"}”`}
              </div>
            </div>
            {!pdf && !pdfError ? <Spinner /> : pdf ? <Icon name="check" className="text-lime-deep" strokeWidth={3} /> : null}
          </div>
          {needsPaidPlan && (
            <div role="alert" className="rounded-2xl border border-[#F0C9C5] bg-[#FBE6E4] p-4 text-sm text-danger">
              <strong className="block">EmailJS didn’t accept the PDF attachment</strong>
              {PAID_PLAN_MESSAGE} <Link href="/settings#emailjs" className="underline">Open Settings</Link>
            </div>
          )}

          <div className="-mx-6 -mb-5 mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper-2 px-6 py-4">
            <span className="inline-flex items-center gap-2 text-[13px] text-muted">
              <span className={`size-2 rounded-full ${ready ? "bg-lime-deep" : "bg-danger"}`} />
              {ready ? "Sends through your EmailJS service" : <>EmailJS isn’t connected (paid plan required) — <Link href="/settings#emailjs" className="underline">{hasEmailJsKeys(profile?.emailjs) ? "verify your keys" : "add keys"}</Link></>}
            </span>
            <div className="flex gap-2">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={phase === "sending"}>Cancel</button>
              <button type="button" className="btn btn-ink" onClick={send} disabled={!ready || phase === "sending" || !to || !pdf || needsPaidPlan}>
                {phase === "sending" ? <Spinner /> : <Icon name="send" size={16} className="text-lime" />}
                {phase === "sending" ? "Sending…" : "Send invoice"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
