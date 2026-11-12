import { isNonEmptyString, zernio } from "@/lib/zernio";

export type MailboxProvider = "google" | "microsoft" | "imap";

/** Zernio platforms whose mailboxes can send email through POST /v1/email/messages. */
const PLATFORMS: MailboxProvider[] = ["google", "microsoft", "imap"];

export interface MailboxAccount {
  id: string;
  /** Mailbox address when Zernio reports it. */
  label: string;
  /** False when a Google or Microsoft account was connected without Email access, so it can't send. */
  canSend: boolean;
  /** Gmail / Google Workspace, Outlook / Microsoft 365, or any other mailbox connected over IMAP/SMTP. */
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
      // `scopeAreas` lists what a Google/Microsoft account was connected for (email, calendar, …). IMAP is email-only.
      const canSend = provider === "imap" || !Array.isArray(a.scopeAreas) || a.scopeAreas.includes("email");
      const disconnected = a.status === "disconnected" || a.isActive === false;
      return id && !disconnected ? { id, label: label ?? id, canSend, provider } : null;
    })
    .filter((a): a is MailboxAccount => !!a);
}

/**
 * Lists every mailbox connected to the caller's Zernio account that can send email —
 * Gmail, Outlook and any IMAP/SMTP email (GET /v1/accounts?platform=…) — so the user just picks one.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null;
  if (!isNonEmptyString(body?.apiKey)) return Response.json({ error: { status: 400, code: "missing_settings", message: "Enter your Zernio API key." } }, { status: 400 });
  const key = body.apiKey.trim();

  const results = await Promise.all(PLATFORMS.map((p) => zernio<unknown>(key, `/accounts?platform=${p}`)));
  // A bad key fails every call; report that. Otherwise one platform failing shouldn't hide the others.
  const failed = results.find((r) => !r.ok && r.error.status === 401) ?? (results.every((r) => !r.ok) ? results[0] : null);
  if (failed && !failed.ok) return Response.json({ error: failed.error }, { status: failed.error.status || 502 });
  const accounts = results.flatMap((r, i) => (r.ok ? normalize(r.data, PLATFORMS[i]) : []));
  return Response.json({ accounts });
}
