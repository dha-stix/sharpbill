/**
 * Shared building blocks for the social share images (app/**\/opengraph-image.tsx).
 * Rendered with next/og (Satori): flexbox only, inline styles, TTF/OTF/WOFF fonts.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export const INK = "#0E1116";
export const LIME = "#C8F031";
export const SOFT = "#B5BAC4";
export const MUTED = "#5B6070";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

/** Fonts are read once per build. latin-ext covers currency signs such as ₦. */
const fontsPromise = Promise.all([
  font("bricolage-grotesque-latin-800-normal.woff"),
  font("bricolage-grotesque-latin-ext-800-normal.woff"),
  font("geist-sans-latin-400-normal.woff"),
  font("geist-sans-latin-500-normal.woff"),
  font("geist-sans-latin-600-normal.woff"),
  font("geist-mono-latin-500-normal.woff"),
]).then(([display, displayExt, sans400, sans500, sans600, mono]) => [
  { name: "Bricolage", data: display, weight: 800 as const, style: "normal" as const },
  { name: "BricolageExt", data: displayExt, weight: 800 as const, style: "normal" as const },
  { name: "Geist", data: sans400, weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: sans500, weight: 500 as const, style: "normal" as const },
  { name: "Geist", data: sans600, weight: 600 as const, style: "normal" as const },
  { name: "GeistMono", data: mono, weight: 500 as const, style: "normal" as const },
]);

export const ogFonts = () => fontsPromise;

/** Display type. Satori ignores `em` letter-spacing, so tracking is given in px for the size. */
export const display = (fontSize: number, tracking = -0.04) =>
  ({ fontFamily: "Bricolage, BricolageExt", fontWeight: 800, fontSize, letterSpacing: Math.round(fontSize * tracking * 10) / 10 }) as const;
export const mono = { fontFamily: "GeistMono", fontWeight: 500 } as const;

const SPARKLE = "M0 -1 C.13 -.27 .27 -.13 1 0 C.27 .13 .13 .27 0 1 C-.13 .27 -.27 .13 -1 0 C-.27 -.13 -.13 -.27 0 -1Z";

export function Sparkle({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  return (
    <svg width={size * 2} height={size * 2} viewBox="-1 -1 2 2" style={{ position: "absolute", left: x - size, top: y - size }}>
      <path d={SPARKLE} fill={fill} />
    </svg>
  );
}

/** Logo mark + wordmark. `onLime` flips colours for the lime background. */
export function Brand({ onLime = false }: { onLime?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: onLime ? INK : LIME,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "rotate(-6deg)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={onLime ? LIME : INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18 18 6M10 6h8v8" />
        </svg>
      </div>
      <div style={{ ...display(32, -0.02), color: onLime ? INK : "#FFFFFF" }}>SharpBill</div>
    </div>
  );
}

export function Check({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size, background: INK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5 10 17 19 7" />
      </svg>
    </div>
  );
}

export function Frame({ background, children }: { background: string; children: ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", overflow: "hidden", background, fontFamily: "Geist" }}>
      {children}
    </div>
  );
}

/** Full-bleed SVG layer for backgrounds and illustrations. */
export function Layer({ children }: { children: ReactNode }) {
  return (
    <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
      {children}
    </svg>
  );
}
