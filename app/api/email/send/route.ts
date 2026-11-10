import { isEmail, isNonEmptyString, zernio } from "@/lib/zernio";

/** Zernio caps attachments at 25 MB in total; base64 adds about a third on top of the file size. */
const MAX_ATTACHMENT_BASE64 = 25 * 1024 * 1024 * 1.37;

type Recipient = { email: string; name?: string };

interface SendBody {
  apiKey: unknown;
  accountId: unknown;
  to: unknown;
  cc?: unknown;
  replyTo?: unknown;
  fromName?: unknown;
  subject: unknown;
  html: unknown;
  text?: unknown;
  attachments?: unknown;
}

const recipients = (v: unknown, max: number): Recipient[] | null => {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.length > max) return null;
  const list = v.map((r) => (r && typeof r === "object" ? (r as Recipient) : null));
  return list.every((r) => r && isEmail(r.email)) ? (list as Recipient[]).map((r) => ({ email: r.email, ...(r.name ? { name: String(r.name).slice(0, 200) } : {}) })) : null;
};

/**
 * Sends one email through the caller's own Zernio account (POST /v1/email/messages).
 * The browser supplies its user's Zernio key and Gmail account ID; this route only checks the
 * request and forwards it, so the key never has to be exposed to Zernio from the browser.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SendBody | null;
  if (!body) return Response.json({ error: { status: 400, message: "Invalid request." } }, { status: 400 });

  const to = recipients(body.to, 100);
  const cc = recipients(body.cc, 100);
  const replyTo = recipients(body.replyTo, 5);
  if (!isNonEmptyString(body.apiKey) || !isNonEmptyString(body.accountId, 200))
    return Response.json({ error: { status: 400, code: "missing_settings", message: "Add your Zernio API key and Gmail account ID in Settings." } }, { status: 400 });
  if (!to?.length || !cc || !replyTo) return Response.json({ error: { status: 400, code: "invalid_recipient", message: "Check the email addresses." } }, { status: 400 });
  if (!isNonEmptyString(body.subject, 998) || !isNonEmptyString(body.html, 2_000_000))
    return Response.json({ error: { status: 400, message: "The email needs a subject and a message." } }, { status: 400 });

  const attachments = Array.isArray(body.attachments) ? (body.attachments as { filename?: unknown; contentType?: unknown; base64?: unknown }[]) : [];
  const size = attachments.reduce((n, a) => n + (typeof a.base64 === "string" ? a.base64.length : 0), 0);
  if (attachments.length > 20 || size > MAX_ATTACHMENT_BASE64 || !attachments.every((a) => isNonEmptyString(a.filename, 255) && isNonEmptyString(a.contentType, 100) && typeof a.base64 === "string"))
    return Response.json({ error: { status: 400, message: "The attachment is too large or invalid." } }, { status: 400 });

  const result = await zernio<{ data?: { id?: string } }>(body.apiKey.trim(), "/email/messages", {
    method: "POST",
    body: {
      accountId: body.accountId.trim(),
      to,
      ...(cc.length ? { cc } : {}),
      ...(replyTo.length ? { replyTo } : {}),
      ...(isNonEmptyString(body.fromName, 200) ? { fromName: body.fromName } : {}),
      subject: body.subject,
      html: body.html,
      ...(isNonEmptyString(body.text, 200_000) ? { text: body.text } : {}),
      ...(attachments.length ? { attachments: attachments.map((a) => ({ filename: a.filename, contentType: a.contentType, base64: a.base64 })) } : {}),
    },
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: result.error.status || 502 });
  return Response.json({ id: result.data?.data?.id ?? null });
}
