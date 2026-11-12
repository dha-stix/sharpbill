import { emailDesign, renderEmail } from "./email-templates";
import { formatDate, formatMoney, initials } from "./format";
import { bankRows } from "./invoice-utils";
import type { Invoice, ZernioSettings } from "./types";

/* ------------------------------------------------------------------ */
/* Zernio connection state                                             */
/* ------------------------------------------------------------------ */

/** Both values are filled in (not necessarily correct). */
export function hasZernioKeys(s?: Partial<ZernioSettings>) {
  return Boolean(s?.apiKey?.trim() && s?.accountId?.trim());
}

/** Identifies a key + account pair, so changing either needs a new check. */
export const zernioFingerprint = (s: Partial<ZernioSettings>) => [s.apiKey, s.accountId].map((v) => (v ?? "").trim()).join("|");

/** True only when this exact key + account has sent a test email successfully. */
export function isZernioReady(s?: Partial<ZernioSettings>) {
  return !!s && hasZernioKeys(s) && s.verifiedKeys === zernioFingerprint(s);
}

/** What the /api/email routes return when Zernio (or the request) fails. */
interface ApiError {
  status: number;
  code?: string;
  message?: string;
  param?: string;
  reason?: string;
  resetsAt?: string;
}

/** Turns a Zernio failure into something the user can act on. */
export function zernioErrorMessage(e: ApiError) {
  switch (e.code) {
    case "missing_credentials":
    case "invalid_credentials":
      return "Your Zernio API key isn’t valid. Create or copy a key in your Zernio dashboard and verify again in Settings.";
    case "reconnect_required":
      return "Your mailbox provider disconnected it from Zernio. Reconnect it in your Zernio dashboard, then verify again in Settings.";
    case "account_reconnect_required":
      return "Your mailbox was disconnected from Zernio (for example, its password or app password changed). Reconnect it in your Zernio dashboard, then verify again in Settings.";
    case "account_scope_missing":
      return "This mailbox is connected to Zernio without email access. Reconnect it in your Zernio dashboard and allow email.";
    case "smtp_auth_failed":
      return "Your email provider refused to let Zernio send from this mailbox. Turn on SMTP (or create an app password) at your provider, then reconnect it in Zernio.";
    case "payment_required":
      return "Zernio needs a payment method on your workspace before it can send emails. Add one in your Zernio dashboard.";
    case "email_send_cap_reached":
      return `You’ve reached today’s sending limit for this mailbox (200 a day; 500 on Google Workspace).${e.resetsAt ? ` It resets ${new Date(e.resetsAt).toLocaleString()}.` : " It resets at midnight UTC."}`;
    case "rate_limited":
      return "Zernio has paused sending for a short while (too many emails in a short time). Try again in a few minutes.";
    case "network_error":
      return "Couldn’t reach Zernio. Check your connection and try again.";
  }
  if (e.status === 404 || e.param === "accountId") return "That mailbox wasn’t found on your Zernio account. Pick it again in Settings.";
  if (e.status === 0) return "Couldn’t reach SharpBill’s server. Check your connection and try again.";
  return e.message ? `Zernio couldn’t send the email: ${e.message}` : "Zernio couldn’t send the email. Please try again.";
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error(zernioErrorMessage({ status: 0 }));
  }
  const json = (await res.json().catch(() => ({}))) as T & { error?: ApiError };
  if (!res.ok) throw new Error(zernioErrorMessage(json.error ?? { status: res.status }));
  return json;
}

export type MailboxProvider = "google" | "microsoft" | "imap";
export interface Mailbox {
  id: string;
  label: string;
  canSend: boolean;
  provider: MailboxProvider;
}

/** Every mailbox connected to a Zernio account that can send (Gmail, Outlook, IMAP/SMTP), for the picker in Settings. */
export async function listMailboxes(apiKey: string) {
  const { accounts } = await postJson<{ accounts: Mailbox[] }>("/api/email/accounts", { apiKey: apiKey.trim() });
  return accounts;
}

/** "Gmail", "Outlook" or "IMAP/SMTP", shown next to each mailbox. */
export const providerLabel = (p?: MailboxProvider) => (p === "microsoft" ? "Outlook" : p === "imap" ? "IMAP/SMTP" : p === "google" ? "Gmail" : "");

/** Daily sending limit text for the connected mailbox. */
export const sendingLimit = (p?: MailboxProvider) =>
  p === "google" ? "Gmail allows 200 emails a day (500 on Google Workspace)." : "Zernio allows about 200 emails a day from one mailbox (your provider may allow fewer).";

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

/** "a@x.com, b@y.com" → [{ email }] */
const splitAddresses = (v?: string) =>
  (v ?? "")
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

interface EmailContent {
  settings: ZernioSettings;
  design?: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  fromName: string;
  subject: string;
  /** Plain-text message; also sent as the email's text part. */
  message: string;
  vars: Record<string, string>;
  pdf: { filename: string; dataUrl: string };
}

/** Fills the chosen design and sends it, with the PDF attached, through the user's Zernio account. */
async function sendEmail({ settings, design, to, cc, bcc, replyTo, fromName, subject, message, vars, pdf }: EmailContent) {
  // Never send an invoice email without a real PDF attached.
  if (!isPdfDataUrl(pdf.dataUrl)) throw new Error("The invoice PDF couldn’t be attached, so the email was not sent. Please try again.");
  const html = renderEmail(emailDesign(design).html, vars);
  return postJson<{ id: string | null }>("/api/email/send", {
    apiKey: settings.apiKey.trim(),
    accountId: settings.accountId.trim(),
    to: splitAddresses(to),
    cc: splitAddresses(cc),
    bcc: splitAddresses(bcc),
    replyTo: splitAddresses(replyTo),
    fromName,
    subject,
    html,
    text: message,
    attachments: [{ filename: `${pdf.filename}.pdf`, contentType: "application/pdf", base64: pdf.dataUrl.slice(pdf.dataUrl.indexOf(",") + 1) }],
  });
}

interface SendArgs {
  settings: ZernioSettings;
  /** Email design id (Settings → Invoice email design). */
  design?: string;
  invoice: Invoice;
  to: string;
  cc?: string;
  /** Hidden copies: these addresses get the email but don't appear to other recipients. */
  bcc?: string;
  subject: string;
  message: string;
  /** Base64 PDF data URL — every invoice email carries the PDF. */
  pdfDataUrl: string;
  /** Link to the stored PDF, for the "Download invoice" button (bank-transfer invoices). */
  downloadUrl?: string;
}

/** Sends an invoice from the user's own mailbox, through their Zernio account, using their chosen email design. */
export async function sendInvoiceEmail({ settings, design, invoice, to, cc, bcc, subject, message, pdfDataUrl, downloadUrl }: SendArgs) {
  const cta = paymentCta(invoice, downloadUrl);
  return sendEmail({
    settings,
    design,
    to,
    cc,
    bcc,
    replyTo: invoice.business.email,
    fromName: invoice.business.name,
    subject,
    message,
    pdf: { filename: invoice.number, dataUrl: pdfDataUrl },
    vars: {
      client_name: invoice.client.name,
      business_name: invoice.business.name,
      business_initials: initials(invoice.business.name),
      business_logo_url: invoice.business.logoUrl || "",
      invoice_number: invoice.number,
      amount: formatMoney(invoice.total, invoice.currency),
      issue_date: formatDate(invoice.issueDate),
      due_date: formatDate(invoice.dueDate),
      message_html: textToHtml(message),
      payment_details_html: paymentDetailsHtml(invoice),
      payment_cta_label: cta.label,
      payment_cta_url: cta.url,
      attachment_note: attachmentNote(invoice.number),
    },
  });
}

/** A small one-page PDF for the test email, so the user can see the attachment arrive. */
async function testPdfDataUrl(businessName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  pdf.setFontSize(20);
  pdf.text("SharpBill test attachment", 20, 30);
  pdf.setFontSize(12);
  pdf.text(`Zernio is connected for ${businessName}. Invoice PDFs will arrive like this one.`, 20, 42, { maxWidth: 170 });
  return `data:application/pdf;base64,${btoa(pdf.output())}`;
}

/**
 * Checks the Zernio key and mailbox by sending a real test email, in the chosen design and with
 * a test PDF attached, to the user's own address. Throws with a readable message if Zernio refuses it.
 */
export async function verifyZernio(settings: ZernioSettings, to: string, businessName: string, design?: string) {
  const message = "This is a test from SharpBill. Your Zernio account is connected — invoices you send will arrive like this, from your own mailbox, with the PDF attached.";
  const today = formatDate(new Date().toISOString().slice(0, 10));
  await sendEmail({
    settings,
    design,
    to,
    replyTo: to,
    fromName: businessName,
    subject: `Test email from ${businessName} — invoice emails are connected`,
    message,
    pdf: { filename: "INV-TEST", dataUrl: await testPdfDataUrl(businessName) },
    vars: {
      client_name: "Test Client",
      business_name: businessName,
      business_initials: initials(businessName),
      invoice_number: "INV-TEST",
      amount: formatMoney(0, "USD"),
      issue_date: today,
      due_date: today,
      message_html: textToHtml(message),
      payment_details_html: "Payment details appear here on real invoices.",
      payment_cta_label: "Pay now",
      payment_cta_url: "https://zernio.com/",
      attachment_note: "\u{1F4CE} A test PDF is attached.",
    },
  });
}
