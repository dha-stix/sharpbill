/**
 * Server-side calls to Zernio (https://docs.zernio.com). Only imported by the /api/email route handlers,
 * so a user's Zernio API key goes browser → SharpBill server → Zernio and never to any other site.
 */
import "server-only";

const ZERNIO_API = "https://zernio.com/api/v1";

/** The parts of Zernio's error envelope SharpBill uses to explain a failure. */
export interface ZernioError {
  status: number;
  code?: string;
  message?: string;
  param?: string;
  reason?: string;
  resetsAt?: string;
}

export type ZernioResult<T> = { ok: true; data: T } | { ok: false; error: ZernioError };

export async function zernio<T>(apiKey: string, path: string, init?: { method?: string; body?: unknown }): Promise<ZernioResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${ZERNIO_API}${path}`, {
      method: init?.method ?? "GET",
      headers: { Authorization: `Bearer ${apiKey}`, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      body: init?.body ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: { status: 0, code: "network_error", message: "Couldn’t reach Zernio." } };
  }
  const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (res.ok) return { ok: true, data: json as T };

  const err = (json ?? {}) as { error?: unknown; message?: string; code?: string; param?: string; reason?: string; details?: { cap?: { resetsAt?: string } } };
  // Zernio puts the message in `error` (a string), with `code` and `param` alongside it.
  const message = typeof err.error === "string" ? err.error : typeof err.message === "string" ? err.message : undefined;
  return {
    ok: false,
    error: { status: res.status, code: err.code, message, param: err.param, reason: err.reason, resetsAt: err.details?.cap?.resetsAt },
  };
}

/** Basic checks on values that come from the browser before they are forwarded. */
export const isNonEmptyString = (v: unknown, max = 500): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
export const isEmail = (v: unknown): v is string => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
