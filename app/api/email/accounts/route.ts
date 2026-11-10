import { isNonEmptyString, zernio } from "@/lib/zernio";

export interface GmailAccount {
  id: string;
  /** Mailbox address when Zernio reports it. */
  label: string;
  /** False when the Google account was connected without Email access, so it can't send. */
  canSend: boolean;
}

/** Picks the fields SharpBill needs from Zernio's account objects, whichever names they use. */
function normalize(raw: unknown): GmailAccount[] {
  const r = raw as Record<string, unknown> | unknown[] | null;
  const list = Array.isArray(r) ? r : Array.isArray(r?.accounts) ? r.accounts : Array.isArray(r?.data) ? r.data : [];
  return (list as Record<string, unknown>[])
    .map((a) => {
      const id = [a._id, a.id, a.accountId].find((v) => typeof v === "string") as string | undefined;
      const label = [a.username, a.email, a.displayName, a.name].find((v) => typeof v === "string") as string | undefined;
      // `scopeAreas` lists what the Google account was connected for (email, calendar, files, contacts).
      const canSend = !Array.isArray(a.scopeAreas) || a.scopeAreas.includes("email");
      return id ? { id, label: label ?? id, canSend } : null;
    })
    .filter((a): a is GmailAccount => !!a);
}

/** Lists the Google (Gmail) mailboxes connected to the caller's Zernio account (GET /v1/accounts?platform=google). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown } | null;
  if (!isNonEmptyString(body?.apiKey)) return Response.json({ error: { status: 400, code: "missing_settings", message: "Enter your Zernio API key." } }, { status: 400 });

  const result = await zernio<unknown>(body.apiKey.trim(), "/accounts?platform=google");
  if (!result.ok) return Response.json({ error: result.error }, { status: result.error.status || 502 });
  return Response.json({ accounts: normalize(result.data) });
}
