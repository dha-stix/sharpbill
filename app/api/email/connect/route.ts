import { isEmail, isNonEmptyString, zernio } from "@/lib/zernio";

interface Profile {
  _id?: string;
  isDefault?: boolean;
}

/** The Zernio profile new mailboxes are connected under: the default one, else the first, else a new "SharpBill" profile. */
async function profileId(key: string) {
  const list = await zernio<{ profiles?: Profile[] }>(key, "/profiles");
  if (!list.ok) return list;
  const profiles = list.data.profiles ?? [];
  const found = (profiles.find((p) => p.isDefault) ?? profiles[0])?._id;
  if (found) return { ok: true as const, id: found };
  const created = await zernio<{ profile?: Profile }>(key, "/profiles", { method: "POST", body: { name: "SharpBill" } });
  if (!created.ok) return created;
  return created.data.profile?._id
    ? { ok: true as const, id: created.data.profile._id }
    : { ok: false as const, error: { status: 502, message: "Zernio didn’t return a profile." } };
}

/**
 * Starts connecting a mailbox to the caller's Zernio account on Zernio's own hosted pages,
 * so mailbox passwords and Google sign-ins never pass through SharpBill.
 *  - provider "google": Gmail / Google Workspace (GET /v1/connect/google, scopes=email)
 *  - provider "imap":   any other email over IMAP/SMTP (GET /v1/connect/email)
 * Returns { authUrl } to send the browser to; Zernio redirects back to `redirectUrl` with the accountId.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { apiKey?: unknown; provider?: unknown; redirectUrl?: unknown; email?: unknown } | null;
  if (!isNonEmptyString(body?.apiKey)) return Response.json({ error: { status: 400, code: "missing_settings", message: "Enter your Zernio API key." } }, { status: 400 });
  if (body.provider !== "google" && body.provider !== "imap") return Response.json({ error: { status: 400, message: "Unknown mailbox type." } }, { status: 400 });

  // Only send people back to the SharpBill page that asked (never to another site).
  const origin = request.headers.get("origin");
  let redirect: URL;
  try {
    redirect = new URL(String(body.redirectUrl));
  } catch {
    return Response.json({ error: { status: 400, message: "Invalid return address." } }, { status: 400 });
  }
  if (!origin || redirect.origin !== origin) return Response.json({ error: { status: 400, message: "Invalid return address." } }, { status: 400 });

  const key = body.apiKey.trim();
  const profile = await profileId(key);
  if (!profile.ok) return Response.json({ error: profile.error }, { status: profile.error.status || 502 });

  const q = new URLSearchParams({ profileId: profile.id, redirect_url: redirect.toString() });
  if (body.provider === "google") {
    q.set("scopes", "email");
    if (isEmail(body.email)) q.set("loginHint", body.email);
  } else if (isEmail(body.email)) q.set("email", body.email);

  const result = await zernio<{ authUrl?: string }>(key, `/connect/${body.provider === "google" ? "google" : "email"}?${q}`);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.error.status || 502 });
  if (!result.data.authUrl?.startsWith("https://")) return Response.json({ error: { status: 502, message: "Zernio didn’t return a sign-in link." } }, { status: 502 });
  return Response.json({ authUrl: result.data.authUrl });
}
