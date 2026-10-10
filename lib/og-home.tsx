import { ImageResponse } from "next/og";
import { Brand, display, Frame, INK, Layer, LIME, mono, MUTED, OG_SIZE, ogFonts, SOFT, Sparkle } from "./og";

export const HOME_IMAGE_ALT = "SharpBill — Invoices that get you paid. Beautiful invoices for freelancers in any currency.";

const LINES = [
  ["Brand identity", "$2,400"],
  ["Landing page", "$1,800"],
  ["Revisions · 4h", "$300"],
];

/** Homepage share image; also served at /og.png as the site-wide default. */
export async function renderHomeImage() {
  return new ImageResponse(
    (
      <Frame background={INK}>
        <Layer>
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="#2A303C" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1200" height="630" fill="url(#grid)" opacity="0.55" />
          <circle cx="930" cy="330" r="250" fill={LIME} />
          <circle cx="930" cy="330" r="292" fill="none" stroke={LIME} strokeOpacity="0.5" strokeWidth="2" strokeDasharray="3 12" strokeLinecap="round" />
          <circle cx="1222" cy="330" r="8" fill={LIME} />
          <path d="M560 660 C 600 600, 620 540, 690 500" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2.5" strokeDasharray="1 11" strokeLinecap="round" />
          <g transform="translate(708 488) rotate(-32)">
            <path d="M-30 -19 L36 0 L-30 19 L-17 0 Z" fill="#FFFFFF" />
            <path d="M-17 0 L36 0" stroke={INK} strokeWidth="3" />
          </g>
        </Layer>
        <Sparkle x={1135} y={95} size={18} fill={LIME} />

        {/* invoice card */}
        <div
          style={{
            position: "absolute",
            left: 770,
            top: 120,
            width: 330,
            display: "flex",
            flexDirection: "column",
            transform: "rotate(-4deg)",
            background: "#FFFFFF",
            color: INK,
            border: `3px solid ${INK}`,
            borderRadius: 22,
            padding: 24,
            boxShadow: `14px 14px 0 ${INK}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ...display(15, 0), width: 40, height: 40, borderRadius: 11, background: INK, color: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>SA</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Studio Ade</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ ...display(20, -0.01) }}>Invoice</div>
              <div style={{ ...mono, fontSize: 12, color: MUTED }}>INV-024</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 18, fontSize: 14 }}>
            {LINES.map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{k}</span>
                <span style={mono}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14, paddingTop: 12, borderTop: "2px dashed #D5D5CC" }}>
            <span style={{ color: MUTED, fontSize: 14 }}>Total</span>
            <span style={{ ...display(34, -0.02) }}>$4,500</span>
          </div>
        </div>

        {/* paid chip */}
        <div style={{ position: "absolute", left: 1000, top: 455, display: "flex", alignItems: "center", gap: 10, transform: "rotate(5deg)", background: INK, color: "#FFFFFF", borderRadius: 16, padding: "12px 16px", fontSize: 15, fontWeight: 600 }}>
          <div style={{ width: 26, height: 26, borderRadius: 26, background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17 19 7" />
            </svg>
          </div>
          Paid
        </div>

        {/* message */}
        <div style={{ position: "absolute", left: 72, top: 64, width: 600, display: "flex", flexDirection: "column", color: "#FFFFFF" }}>
          <Brand />
          <div style={{ ...display(92), marginTop: 40, lineHeight: 0.92, display: "flex", flexDirection: "column" }}>
            <span>Invoices that</span>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span>get you</span>
              <span style={{ background: LIME, color: INK, padding: "0 14px 6px", borderRadius: 14, transform: "rotate(-2deg)" }}>paid.</span>
            </div>
          </div>
          <div style={{ marginTop: 26, fontSize: 25, lineHeight: 1.4, color: SOFT, maxWidth: 560 }}>
            Beautiful invoices for freelancers — any currency, emailed or downloaded as a PDF.
          </div>
        </div>

        <div style={{ position: "absolute", left: 72, bottom: 56, display: "flex", gap: 12 }}>
          {["8 invoice designs", "Email + PDF", "Any currency"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 16px", borderRadius: 999, border: "2px solid #2A303C", color: "#FFFFFF", fontSize: 17, fontWeight: 500 }}>
              {t}
            </div>
          ))}
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await ogFonts() }
  );
}
