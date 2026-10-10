import { formatDate, formatMoney, initials } from "./format";
import { bankRows } from "./invoice-utils";
import type { EmailJsSettings, Invoice } from "./types";

/** All three keys are filled in (not necessarily correct). */
export function hasEmailJsKeys(s?: EmailJsSettings) {
  return Boolean(s?.serviceId?.trim() && s?.templateId?.trim() && s?.publicKey?.trim());
}

/** Identifies a set of keys, so a later change to any of them needs a new check. */
export const emailJsFingerprint = (s: EmailJsSettings) => [s.serviceId, s.templateId, s.publicKey].map((v) => v.trim()).join("|");

/** True only when these exact keys have sent a test email successfully. */
export function isEmailJsReady(s?: EmailJsSettings) {
  return !!s && hasEmailJsKeys(s) && s.verifiedKeys === emailJsFingerprint(s);
}

/** Shown wherever EmailJS refuses the invoice PDF. */
export const PAID_PLAN_MESSAGE =
  "EmailJS refused the PDF attachment. Check two things in EmailJS, then verify your keys again in Settings: (1) your template’s Attachments tab has a Variable Attachment with the parameter name invoice_pdf, and (2) your account is on a paid plan (Personal or above) — the Free plan has no attachments.";

/**
 * EmailJS allows 50 KB of plain variables on every plan; a PDF only escapes that limit when the template
 * declares it as a Variable Attachment (paid plans). So this error on an invoice email means the PDF
 * wasn't accepted as an attachment: the template lacks the `invoice_pdf` attachment, or the plan is Free.
 */
export const isVariablesTooLarge = (err: unknown) => /variables size limit/i.test((err as { text?: string })?.text ?? "");

/** Turns an EmailJS failure into something the user can act on. */
export function emailJsErrorMessage(err: unknown) {
  const { status, text } = (err ?? {}) as { status?: number; text?: string };
  const t = (text || (err as Error)?.message || "").trim();
  if (/public key/i.test(t)) return "The Public key is not valid. Copy it from EmailJS → Account → General.";
  if (/service id/i.test(t)) return "That Service ID doesn’t exist on this EmailJS account. Copy it from EmailJS → Email Services.";
  if (/template id/i.test(t)) return "That Template ID doesn’t exist on this EmailJS account. Copy it from EmailJS → Email Templates.";
  if (/recipients? address is empty/i.test(t)) return "The keys work, but the template has no recipient. Set its “To Email” field to {{to_email}} in EmailJS.";
  if (isVariablesTooLarge(err)) return PAID_PLAN_MESSAGE;
  if (status === 412) return `EmailJS couldn’t send through your email service — reconnect it in EmailJS → Email Services.${t ? ` (${t})` : ""}`;
  if (status === 426 || /quota|limit/i.test(t)) return `Your EmailJS account has reached a sending limit.${t ? ` (${t})` : ""}`;
  if (status === 429) return "EmailJS is rate-limiting requests. Wait a few seconds and try again.";
  if (status === 0 || /failed to fetch|network/i.test(t)) return "Couldn’t reach EmailJS. Check your internet connection and try again.";
  return t ? `EmailJS rejected the request: ${t}` : "EmailJS rejected the request.";
}

/**
 * A one-page PDF for the test email. It is deliberately the size of a real invoice PDF (over 50 KB):
 * EmailJS only accepts that when the template has the `invoice_pdf` attachment and the plan allows attachments.
 */
async function testPdfDataUrl(businessName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setFontSize(20);
  pdf.text("SharpBill test attachment", 20, 30);
  pdf.setFontSize(12);
  pdf.text(`EmailJS is connected for ${businessName}. Invoice PDFs will arrive like this one.`, 20, 42, { maxWidth: 170 });
  // A block of random pixels can't be compressed, which gives the file a realistic size.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 360;
  const ctx = canvas.getContext("2d")!;
  const noise = ctx.createImageData(360, 360);
  for (let i = 0; i < noise.data.length; i++) noise.data[i] = i % 4 === 3 ? 255 : Math.floor(Math.random() * 256);
  ctx.putImageData(noise, 0, 0);
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 20, 56, 60, 60);
  pdf.setFontSize(9);
  pdf.text("Test pattern (gives this file the size of a real invoice).", 20, 122);
  return `data:application/pdf;base64,${btoa(pdf.output())}`;
}

/**
 * Checks the keys the only way EmailJS allows: by sending a real test email (to the user's own address).
 * The test carries a PDF the size of a real invoice, so it only passes when the keys are right, the template
 * has the `invoice_pdf` attachment, and the account is on a plan that allows attachments.
 * Resolves when EmailJS accepts it; throws with a readable message otherwise.
 */
export async function verifyEmailJs(settings: EmailJsSettings, to: string, businessName: string) {
  const emailjs = (await import("@emailjs/browser")).default;
  const message = "This is a test from SharpBill. Your EmailJS keys are correct — invoices you send will arrive like this, with the PDF attached.";
  const today = formatDate(new Date().toISOString().slice(0, 10));
  try {
    await emailjs.send(
      settings.serviceId.trim(),
      settings.templateId.trim(),
      {
        to_email: to,
        cc_email: "",
        reply_to: to,
        subject: `Test email from ${businessName} — EmailJS is connected`,
        message,
        message_html: textToHtml(message),
        client_name: "Test Client",
        business_name: businessName,
        business_initials: initials(businessName),
        business_logo_url: "",
        invoice_number: "INV-TEST",
        amount: formatMoney(0, "USD"),
        issue_date: today,
        due_date: today,
        payment_details_html: "Payment details appear here on real invoices.",
        payment_cta_label: "Pay now",
        payment_cta_url: "https://www.emailjs.com/",
        payment_link: "",
        attachment_note: "\u{1F4CE} A test PDF is attached.",
        invoice_pdf: await testPdfDataUrl(businessName),
      },
      { publicKey: settings.publicKey.trim() },
    );
  } catch (err) {
    throw new Error(emailJsErrorMessage(err));
  }
}

export function defaultEmailSubject(inv: Invoice) {
  return `Invoice ${inv.number} from ${inv.business.name}`;
}

const escapeHtml = (t: string) =>
  t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text → safe HTML with line breaks (sent as {{{message_html}}}). */
export const textToHtml = (t: string) => escapeHtml(t).replace(/\r?\n/g, "<br>");

/** Links typed without a scheme ("pay.example.com/x") would be dead in an email. */
export const absoluteUrl = (u: string) => (/^[a-z][a-z0-9+.-]*:/i.test(u.trim()) ? u.trim() : `https://${u.trim()}`);

/** "How to pay" block for the email, as safe HTML. */
export function paymentDetailsHtml(inv: Invoice) {
  const p = inv.payment;
  if (p.type === "link" && p.link) {
    const url = escapeHtml(absoluteUrl(p.link));
    return `Pay online: <a href="${url}" style="color:inherit;">${url.replace(/^https?:\/\//, "")}</a>`;
  }
  const rows = bankRows(p.bank);
  return rows.length
    ? rows.map(([k, v]) => `${k}: <strong>${escapeHtml(v)}</strong>`).join("<br>")
    : "Reply to this email for payment details.";
}

/** True when the email's button should be "Pay now" (a payment link); otherwise it is "Download invoice". */
export const paysByLink = (inv: Invoice) => inv.payment.type === "link" && !!inv.payment.link.trim();

/**
 * The email's button: "Pay now" → the payment link, or, when paying by bank transfer,
 * "Download invoice" → the stored PDF (`downloadUrl`).
 */
export function paymentCta(inv: Invoice, downloadUrl?: string) {
  if (paysByLink(inv)) return { label: "Pay now", url: absoluteUrl(inv.payment.link) };
  if (!downloadUrl) throw new Error("The invoice download link is missing.");
  return { label: "Download invoice", url: downloadUrl };
}

/** The line in every email telling the client the PDF is attached. */
export const attachmentNote = (number: string) => `\u{1F4CE} Invoice ${number} is attached to this email as a PDF — download it for your records.`;

export function defaultEmailMessage(inv: Invoice) {
  const greeting = inv.client.contactName ? `Hi ${inv.client.contactName.split(" ")[0]},` : `Hi ${inv.client.name} team,`;
  return [
    greeting,
    "",
    `Please find invoice ${inv.number} attached to this email as a PDF, for ${formatMoney(inv.total, inv.currency)}, due on ${formatDate(inv.dueDate, { day: "numeric", month: "long", year: "numeric" })}.`,
    "",
    "Thank you for your business!",
    inv.business.name,
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");
}

/** A base64 data URL whose content really is a PDF. */
function isPdfDataUrl(url: string) {
  const prefix = "data:application/pdf;base64,";
  if (!url?.startsWith(prefix)) return false;
  try {
    return atob(url.slice(prefix.length, prefix.length + 8)).startsWith("%PDF");
  } catch {
    return false;
  }
}

interface SendArgs {
  settings: EmailJsSettings;
  invoice: Invoice;
  to: string;
  cc?: string;
  subject: string;
  message: string;
  /** Base64 PDF data URL — every invoice email carries the PDF. */
  pdfDataUrl: string;
  /** Link to the stored PDF, for the "Download invoice" button (bank-transfer invoices). */
  downloadUrl?: string;
}

/**
 * Sends the invoice through the user's own EmailJS account.
 * The EmailJS template must have a "Variable Attachment" with parameter name
 * `invoice_pdf` (content type application/pdf) for the PDF to be attached.
 */
export async function sendInvoiceEmail({ settings, invoice, to, cc, subject, message, pdfDataUrl, downloadUrl }: SendArgs) {
  // Never send an invoice email without a real PDF attached.
  if (!isPdfDataUrl(pdfDataUrl)) throw new Error("The invoice PDF couldn’t be attached, so the email was not sent. Please try again.");
  const emailjs = (await import("@emailjs/browser")).default;
  const cta = paymentCta(invoice, downloadUrl);
  return emailjs.send(
    settings.serviceId,
    settings.templateId,
    {
      to_email: to,
      cc_email: cc || "",
      reply_to: invoice.business.email,
      subject,
      message,
      client_name: invoice.client.name,
      business_name: invoice.business.name,
      business_initials: initials(invoice.business.name),
      business_logo_url: invoice.business.logoUrl || "",
      invoice_number: invoice.number,
      amount: formatMoney(invoice.total, invoice.currency),
      issue_date: formatDate(invoice.issueDate),
      due_date: formatDate(invoice.dueDate),
      // HTML variables — use triple braces in EmailJS: {{{message_html}}}
      message_html: textToHtml(message),
      payment_details_html: paymentDetailsHtml(invoice),
      payment_cta_label: cta.label,
      payment_cta_url: cta.url,
      // kept for templates made before the HTML variables existed
      payment_link: invoice.payment.type === "link" && invoice.payment.link ? absoluteUrl(invoice.payment.link) : "",
      attachment_note: attachmentNote(invoice.number),
      invoice_pdf: pdfDataUrl,
    },
    { publicKey: settings.publicKey }
  );
}
