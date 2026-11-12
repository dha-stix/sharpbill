import { isNonEmptyString, zernio } from "@/lib/zernio";

export type MailboxProvider = "google" | "imap";

export interface MailboxAccount {
  id: string;
  /** Mailbox address when Zernio reports it. */
  label: string;
  /** False when a Google account was connected without Email access, so it can't send. */
  canSend: boolean;
  /** Gmail / Google Workspace, or any other mailbox connected over IMAP/SMTP. */
  provider: MailboxProvider;
}

/** Picks the fields SharpBill needs from Zernio's account objects, whichever names they use. */
function normalize(raw: unknown, provider: MailboxProvider): MailboxAccount[] {
  const r = raw as Record<string, unknown> | unknown[] | null;
  const list = Array.isArray(r) ? r : Array.isArray(r?.accounts) ? r.accounts : Array.isArray(r?.data) ? r.data : [];
  return (list as Record<string, unknown>[])
    .map((a) => {
      const id = [a._id, a.id, a.accountId].find((v) => typeof v === "string") as string | undefined;
      const label = [a.email, a.username, a.displayName, a.name].find((v) => typeof v === "string") as string | undefined;
      // `scopeAreas` lists what a Google account was connected for (email, calendar, files, contacts). IMAP is email-only.
      const canSend = provider === "imap" || !Array.isArray(a.scopeAreas) || a.scopeAreas.includes("email");
      const disconnected = a.status === "disconnected" || a.isActive === false;
      return id && !disconnected ? { id, label: label ?? id, canSend, provider } : null;
    })
    .filter((a): a is MailboxAccount => !!a);
}

/**
 * Lists the mailboxes connected to the caller's Zernio account that can send email:
 * Gmail (GET /v1/accounts?platform=google) and any other provider over IMAP/SMTP (platform=imap).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null;
  if (!isNonEmptyString(body?.apiKey)) return Response.json({ error: { status: 400, code: "missing_settings", message: "Enter your Zernio API key." } }, { status: 400 });
  const key = body.apiKey.trim();

  const [google, imap] = await Promise.all([zernio<unknown>(key, "/accounts?platform=google"), zernio<unknown>(key, "/accounts?platform=imap")]);
  // A bad key fails both; report that. Otherwise one platform failing shouldn't hide the other.
  if (!google.ok && !imap.ok) return Response.json({ error: google.error }, { status: google.error.status || 502 });
  if (!google.ok && google.error.status === 401) return Response.json({ error: google.error }, { status: 401 });
  const accounts = [...(google.ok ? normalize(google.data, "google") : []), ...(imap.ok ? normalize(imap.data, "imap") : [])];
  return Response.json({ accounts });
}
