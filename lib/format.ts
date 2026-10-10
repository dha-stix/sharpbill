import { CURRENCIES } from "./constants";
import type { Address } from "./types";

export function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return `${currencySymbol(currency)}${(amount || 0).toFixed(2)}`;
  }
}

/** Compact form for dashboards: $18.4k */
export function formatCompact(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount || 0);
  } catch {
    return formatMoney(amount, currency);
  }
}

export function formatDate(iso?: string | number | null, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  if (!iso) return "—";
  const d = typeof iso === "number" ? new Date(iso) : new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", opts);
}

export function toISODate(d: Date) {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function daysUntil(iso: string) {
  const today = new Date(`${toISODate(new Date())}T00:00:00`).getTime();
  const due = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((due - today) / 86400000);
}

export function padNumber(n: number, size = 3) {
  return String(n).padStart(size, "0");
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function addressLines(a?: Partial<Address>) {
  if (!a) return [];
  const cityLine = [a.city, a.state, a.postalCode].filter(Boolean).join(", ");
  return [a.street, cityLine, a.country].filter(Boolean) as string[];
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const LEGAL_SUFFIX = /[,\s]+(ltd\.?|limited|llc|l\.l\.c\.|inc\.?|incorporated|plc|gmbh|co\.?|corp\.?|corporation|company|s\.a\.|pty)$/i;

/**
 * Shortens long display names (greetings, sidebar, top bar) without cutting words:
 * 1. strip trailing legal suffixes ("Ltd", "Inc.", "GmbH"…), repeatedly
 * 2. keep as many whole words as fit in `max` characters, adding "…"
 * 3. a single over-long word is hard-truncated.
 * Always pair with a `title` attribute holding the full name.
 */
export function shortName(name: string, max = 18) {
  const clean = (name || "").trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  let core = clean;
  while (LEGAL_SUFFIX.test(core)) core = core.replace(LEGAL_SUFFIX, "").trim();
  if (core && core.length <= max) return core;
  const words = (core || clean).split(" ");
  let out = "";
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > max - 1) break;
    out = next;
  }
  return out ? `${out}…` : `${clean.slice(0, max - 1)}…`;
}

/** First name for greetings, e.g. "Adebayo" from "Adebayo Ogunlesi". */
export function firstName(name: string, max = 14) {
  const first = (name || "").trim().split(/[\s@._-]+/)[0] || "";
  return first ? shortName(first.charAt(0).toUpperCase() + first.slice(1), max) : "";
}
