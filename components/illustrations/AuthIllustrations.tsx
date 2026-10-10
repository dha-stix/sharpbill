"use client";

import { motion } from "framer-motion";
import { Float, Orbit, PlaneOnPath, Sparkle } from "./Primitives";

/** Login: laptop showing an invoice, floating key, orbit, plane. */
export function LoginIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 560 420" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id="login-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#FFFFFF" opacity=".12" />
        </pattern>
      </defs>
      <rect width="560" height="420" fill="url(#login-dots)" />
      <motion.circle cx="290" cy="215" r="170" fill="#1C212B" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9 }} style={{ originX: "50%", originY: "50%" }} />
      <Orbit cx={290} cy={215} r={200} stroke="#C8F031" duration={50} />
      <motion.g initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>
        <g transform="translate(150 150)">
          <rect x="20" y="0" width="240" height="150" rx="12" fill="#262B36" stroke="#C8F031" strokeWidth="2" />
          <rect x="34" y="14" width="212" height="122" rx="4" fill="#F5F5F0" />
          <rect x="50" y="28" width="26" height="26" rx="6" fill="#0E1116" />
          <rect x="170" y="30" width="60" height="10" rx="3" fill="#0E1116" />
          {[[66, 180], [80, 140], [94, 160]].map(([y, w], i) => (
            <motion.rect key={y} x="50" y={y} height="6" rx="3" fill="#D9D9D0" initial={{ width: 0 }} animate={{ width: w }} transition={{ delay: 0.8 + i * 0.15, duration: 0.6 }} />
          ))}
          <motion.rect x="160" y="110" width="70" height="16" rx="4" fill="#C8F031" animate={{ opacity: [1, 0.55, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <path d="M0 150 h280 l-14 18 h-252 z" fill="#3A4150" stroke="#C8F031" strokeWidth="2" strokeLinejoin="round" />
        </g>
      </motion.g>
      <Float amp={10} duration={4}>
        <g transform="translate(440 320) rotate(-30)">
          <circle cx="0" cy="0" r="22" fill="none" stroke="#C8F031" strokeWidth="7" />
          <path d="M22 0 h56 M62 0 v14 M74 0 v10" stroke="#C8F031" strokeWidth="7" strokeLinecap="round" />
        </g>
      </Float>
      <PlaneOnPath d="M30 380 C 90 300, 60 200, 150 150 S 300 60, 520 40" duration={7} trail="#FFFFFF" trailOpacity={0.35} body="#C8F031" accent="#0E1116" scale={0.75} />
      <Sparkle x={80} y={90} size={12} fill="#C8F031" />
      <Sparkle x={510} y={140} size={9} fill="#FFFFFF" delay={1.2} />
    </svg>
  );
}

/** Register: invoice stack launching a paper plane through confetti. */
export function RegisterIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 520 300" className="h-full max-h-full w-full max-w-[520px]">
      <PlaneOnPath d="M210 170 C 260 120, 300 150, 340 100 S 430 40, 500 30" duration={5} body="#0E1116" accent="#FFFFFF" scale={1.15} />
      <motion.g initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>
        <g transform="translate(70 70)">
          <motion.rect x="18" y="26" width="150" height="190" rx="10" fill="#0E1116" initial={{ rotate: 0 }} animate={{ rotate: -8 }} transition={{ delay: 0.4, type: "spring" }} />
          <motion.rect x="10" y="16" width="150" height="190" rx="10" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2.5" initial={{ rotate: 0 }} animate={{ rotate: 4 }} transition={{ delay: 0.5, type: "spring" }} />
          <rect x="0" y="0" width="150" height="190" rx="10" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2.5" />
          <rect x="16" y="16" width="30" height="30" rx="8" fill="#0E1116" />
          <rect x="88" y="20" width="46" height="9" rx="3" fill="#0E1116" />
          <rect x="88" y="34" width="30" height="6" rx="3" fill="#8A8F9C" />
          {[[66, 118], [80, 96], [94, 108]].map(([y, w], i) => (
            <motion.rect key={y} x="16" y={y} height="6" rx="3" fill="#D9D9D0" initial={{ width: 0 }} animate={{ width: w }} transition={{ delay: 0.7 + i * 0.12, duration: 0.5 }} />
          ))}
          <path d="M16 120 h118" stroke="#0E1116" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="70" y="134" width="64" height="20" rx="5" fill="#C8F031" stroke="#0E1116" strokeWidth="2" />
          <rect x="16" y="166" width="118" height="10" rx="4" fill="#0E1116" />
          <g transform="translate(150 190)">
            <motion.g initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 1.1, duration: 0.5 }}>
              <motion.g animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: 1.6 }}>
                <circle r="28" fill="#0E1116" />
                <motion.path d="M-12 1 L-3 10 L13 -8" fill="none" stroke="#C8F031" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.5 }} />
              </motion.g>
            </motion.g>
          </g>
        </g>
      </motion.g>
      {[
        { x: 400, y: 150, r: 20, shape: "rect" },
        { x: 460, y: 110, r: 0, shape: "circle" },
        { x: 330, y: 232, r: -30, shape: "bar" },
      ].map((c, i) => (
        <motion.g key={i} animate={{ y: [0, -10, 0], rotate: [c.r, c.r + 25, c.r] }} transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}>
          {c.shape === "rect" && <rect x={c.x} y={c.y} width="10" height="10" fill="#0E1116" />}
          {c.shape === "circle" && <circle cx={c.x} cy={c.y} r="6" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2" />}
          {c.shape === "bar" && <rect x={c.x} y={c.y} width="22" height="6" rx="3" fill="#0E1116" />}
        </motion.g>
      ))}
      <Sparkle x={40} y={60} size={14} />
      <Sparkle x={470} y={230} size={10} delay={1.1} />
    </svg>
  );
}

/** Business setup: storefront with awning and floating logo tile. */
export function StorefrontIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 340 200" className="block w-full">
      <defs>
        <pattern id="store-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="#FFFFFF" opacity=".12" />
        </pattern>
      </defs>
      <rect width="340" height="200" fill="url(#store-dots)" />
      <Orbit cx={270} cy={50} r={26} stroke="#C8F031" duration={20} dots={false} />
      <motion.circle cx="270" cy="50" r="12" fill="#C8F031" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.g initial={{ y: 60 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
        <rect x="70" y="80" width="200" height="120" fill="#F5F5F0" />
        <rect x="90" y="112" width="70" height="56" rx="4" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2" />
        <path d="M100 126 h40 M100 136 h30 M100 146 h44" stroke="#D9D9D0" strokeWidth="4" strokeLinecap="round" />
        <rect x="190" y="112" width="56" height="88" rx="4" fill="#0E1116" />
        <circle cx="234" cy="158" r="3.5" fill="#C8F031" />
        <rect x="198" y="120" width="40" height="22" rx="3" fill="#262B36" />
      </motion.g>
      <motion.g initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 140, damping: 14 }}>
        <path d="M60 80 h220 l-12 -34 h-196 z" fill="#C8F031" stroke="#0E1116" strokeWidth="2" />
        <path d="M60 80 q18 18 36 0 q18 18 36 0 q18 18 36 0 q18 18 36 0 q18 18 36 0 q18 18 40 0" fill="#C8F031" stroke="#0E1116" strokeWidth="2" strokeLinejoin="round" />
        <rect x="96" y="56" width="148" height="18" rx="4" fill="#0E1116" />
        <text x="170" y="69" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="800" fontSize="12" fill="#C8F031">YOUR BUSINESS</text>
      </motion.g>
      <Float amp={8} duration={4}>
        <rect x="18" y="30" width="44" height="44" rx="12" fill="#C8F031" stroke="#0E1116" strokeWidth="2" />
        <path d="M30 62 L50 42 M38 42 h12 v12" stroke="#0E1116" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Float>
    </svg>
  );
}
