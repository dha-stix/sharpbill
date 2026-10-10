import { ImageResponse } from "next/og";
import { Brand, Check, display, Frame, INK, Layer, LIME, OG_CONTENT_TYPE, OG_SIZE, ogFonts, Sparkle } from "@/lib/og";

export const alt = "Create your SharpBill account — start billing like a pro in minutes.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const PERKS = [
  ["8 invoice designs", "Any currency"],
  ["Email with PDF attached", "Auto INV-001 numbering"],
];

export default async function Image() {
  return new ImageResponse(
    (
      <Frame background={LIME}>
        <Layer>
          <defs>
            <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill={INK} opacity="0.12" />
            </pattern>
          </defs>
          <rect width="1200" height="630" fill="url(#dots)" />
          <path d="M880 330 C 940 260, 980 300, 1030 230 S 1120 140, 1170 120" fill="none" stroke={INK} strokeWidth="2.6" strokeDasharray="1 11" strokeLinecap="round" />
          <g transform="translate(1110 150) rotate(-30)">
            <path d="M-34 -21 L40 0 L-34 21 L-19 0 Z" fill={INK} />
            <path d="M-19 0 L40 0" stroke="#FFFFFF" strokeWidth="3" />
            <path d="M-19 0 L-9 18 L4 4" fill="#3A4150" />
          </g>
          {/* invoice stack */}
          <g transform="translate(720 150)">
            <rect x="24" y="30" width="200" height="270" rx="14" fill={INK} transform="rotate(-8 124 165)" />
            <rect x="12" y="18" width="200" height="270" rx="14" fill="#FFFFFF" stroke={INK} strokeWidth="3" transform="rotate(4 112 153)" />
            <rect x="0" y="0" width="200" height="270" rx="14" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
            <rect x="20" y="20" width="40" height="40" rx="10" fill={INK} />
            <rect x="116" y="26" width="64" height="12" rx="4" fill={INK} />
            <rect x="116" y="44" width="42" height="8" rx="4" fill="#8A8F9C" />
            <rect x="20" y="90" width="160" height="8" rx="4" fill="#D9D9D0" />
            <rect x="20" y="108" width="128" height="8" rx="4" fill="#D9D9D0" />
            <rect x="20" y="126" width="146" height="8" rx="4" fill="#D9D9D0" />
            <path d="M20 160 h160" stroke={INK} strokeWidth="2.5" strokeDasharray="5 5" />
            <rect x="92" y="178" width="88" height="28" rx="7" fill={LIME} stroke={INK} strokeWidth="2.5" />
            <rect x="20" y="226" width="160" height="14" rx="5" fill={INK} />
            <g transform="translate(200 270)">
              <circle r="40" fill={INK} />
              <path d="M-17 1 L-4 14 L18 -11" fill="none" stroke={LIME} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
          <rect x="1080" y="430" width="16" height="16" fill={INK} transform="rotate(20 1088 438)" />
          <circle cx="1140" cy="360" r="9" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
        </Layer>
        <Sparkle x={680} y={100} size={18} fill={INK} />

        <div style={{ position: "absolute", left: 72, top: 64, width: 640, display: "flex", flexDirection: "column", color: INK }}>
          <Brand onLime />
          <div style={{ ...display(76), marginTop: 36, lineHeight: 0.94, display: "flex", flexDirection: "column" }}>
            <span>Start billing like a</span>
            <span>pro in minutes.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30 }}>
            {PERKS.map((row) => (
              <div key={row[0]} style={{ display: "flex", gap: 24 }}>
                {row.map((p) => (
                  <div key={p} style={{ width: 290, display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 500 }}>
                    <Check />
                    {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", left: 72, bottom: 50, display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 999, background: INK, color: "#FFFFFF", fontSize: 19, fontWeight: 600, boxShadow: "6px 6px 0 #FFFFFF" }}>
          Create your account
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </Frame>
    ),
    { ...size, fonts: await ogFonts() }
  );
}
