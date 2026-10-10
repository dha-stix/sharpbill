import { ImageResponse } from "next/og";
import { Brand, display, Frame, INK, Layer, LIME, mono, MUTED, OG_CONTENT_TYPE, OG_SIZE, ogFonts, SOFT, Sparkle } from "@/lib/og";

export const alt = "Log in to SharpBill — your invoices, right where you left them.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    (
      <Frame background={INK}>
        <Layer>
          <defs>
            <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="#FFFFFF" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="1200" height="630" fill="url(#dots)" />
          <circle cx="905" cy="315" r="230" fill="#1C212B" />
          <circle cx="905" cy="315" r="272" fill="none" stroke={LIME} strokeWidth="2" strokeDasharray="3 12" strokeLinecap="round" />
          <circle cx="1177" cy="315" r="8" fill={LIME} />
          {/* laptop */}
          <g transform="translate(745 215)">
            <rect x="20" y="0" width="280" height="176" rx="14" fill="#262B36" stroke={LIME} strokeWidth="2.5" />
            <rect x="36" y="16" width="248" height="144" rx="5" fill="#F5F5F0" />
            <rect x="54" y="32" width="30" height="30" rx="7" fill={INK} />
            <rect x="196" y="34" width="70" height="12" rx="3" fill={INK} />
            <rect x="54" y="78" width="212" height="7" rx="3.5" fill="#D9D9D0" />
            <rect x="54" y="94" width="164" height="7" rx="3.5" fill="#D9D9D0" />
            <rect x="54" y="110" width="188" height="7" rx="3.5" fill="#D9D9D0" />
            <rect x="186" y="128" width="80" height="18" rx="4" fill={LIME} />
            <path d="M0 176 h320 l-16 20 h-288 z" fill="#3A4150" stroke={LIME} strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          {/* key */}
          <g transform="translate(1080 105) rotate(-30)">
            <circle cx="0" cy="0" r="24" fill="none" stroke={LIME} strokeWidth="8" />
            <path d="M24 0 h62 M68 0 v16 M80 0 v11" stroke={LIME} strokeWidth="8" strokeLinecap="round" />
          </g>
        </Layer>
        <Sparkle x={700} y={120} size={16} fill={LIME} />

        <div style={{ position: "absolute", left: 690, top: 72, width: 220, display: "flex", flexDirection: "column", transform: "rotate(-5deg)", background: "#FFFFFF", color: INK, borderRadius: 18, padding: "18px 20px", boxShadow: "0 30px 60px -30px #000" }}>
          <div style={{ ...mono, fontSize: 13, color: MUTED }}>INV-031</div>
          <div style={{ ...display(30, -0.01), marginTop: 4 }}>€1,250.00</div>
          <div style={{ display: "flex", marginTop: 10 }}>
            <div style={{ padding: "5px 11px", borderRadius: 999, background: "#E2F3E8", color: "#1F6B42", fontSize: 13, fontWeight: 600 }}>PAID</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 905, top: 405, width: 210, display: "flex", flexDirection: "column", transform: "rotate(5deg)", background: LIME, color: INK, borderRadius: 18, padding: "18px 20px" }}>
          <div style={{ ...mono, fontSize: 13 }}>INV-032 · SENT</div>
          <div style={{ ...display(30, -0.01), marginTop: 4 }}>₦480,000</div>
          <div style={{ fontSize: 14, marginTop: 8 }}>Due in 14 days</div>
        </div>

        <div style={{ position: "absolute", left: 72, top: 64, width: 580, display: "flex", flexDirection: "column", color: "#FFFFFF" }}>
          <Brand />
          <div style={{ ...display(78), marginTop: 40, lineHeight: 0.95, display: "flex", flexDirection: "column" }}>
            <span>Your invoices,</span>
            <span>right where you</span>
            <span style={{ color: LIME }}>left them.</span>
          </div>
          <div style={{ marginTop: 26, fontSize: 25, color: SOFT }}>Log in to your SharpBill workspace.</div>
        </div>

        <div style={{ position: "absolute", left: 72, bottom: 56, display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderRadius: 999, background: "#FFFFFF", color: INK, fontSize: 19, fontWeight: 600 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Sign in with Google or email
        </div>
      </Frame>
    ),
    { ...size, fonts: await ogFonts() }
  );
}
