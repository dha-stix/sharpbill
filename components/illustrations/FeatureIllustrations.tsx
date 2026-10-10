"use client";

import { motion } from "framer-motion";
import { Float, PlaneOnPath, Sparkle } from "./Primitives";

const inView = { initial: "hidden", whileInView: "show", viewport: { once: true, margin: "-40px" } } as const;

/** Envelope with an invoice sliding in and out, plane flying overhead. */
export function MailIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 220" className="w-full max-w-[340px]">
      <PlaneOnPath d="M20 190 C 80 190, 90 110, 160 110 S 250 60, 290 20" duration={5} trail="#C8F031" body="#C8F031" accent="#0E1116" scale={0.75} />
      <g transform="translate(40 80)">
        <rect x="0" y="40" width="150" height="100" rx="10" fill="#1C212B" stroke="#C8F031" strokeWidth="2" />
        <motion.g animate={{ y: [-38, 0, 0, -38] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.7, 1], ease: "easeInOut" }}>
          <rect x="16" y="0" width="118" height="110" rx="6" fill="#FFFFFF" />
          <rect x="28" y="14" width="40" height="8" rx="2" fill="#0E1116" />
          <rect x="28" y="32" width="90" height="5" rx="2" fill="#D9D9D0" />
          <rect x="28" y="44" width="70" height="5" rx="2" fill="#D9D9D0" />
          <rect x="80" y="62" width="40" height="10" rx="2" fill="#C8F031" />
        </motion.g>
        <path d="M0 50 L75 105 L150 50 L150 140 L0 140 Z" fill="#262B36" stroke="#C8F031" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Printer pushing out a PDF page. */
export function PrinterIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 140" className="w-full max-w-[220px]">
      <rect x="30" y="40" width="140" height="60" rx="12" fill="#0E1116" />
      <rect x="50" y="18" width="100" height="26" rx="4" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2.5" />
      <motion.circle cx="150" cy="58" r="5" fill="#C8F031" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      <motion.g animate={{ y: [-44, 0, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 1], ease: [0.3, 0.7, 0.2, 1] }}>
        <rect x="56" y="80" width="88" height="54" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2.5" />
        <text x="100" y="113" textAnchor="middle" fontFamily="var(--font-geist-mono)" fontSize="14" fontWeight="600" fill="#0E1116">PDF</text>
      </motion.g>
      <rect x="44" y="76" width="112" height="8" rx="4" fill="#2A303C" />
    </svg>
  );
}

/** Two invoice tags with a "+1" counter that pops. */
export function NumberingIllustration() {
  return (
    <motion.svg aria-hidden="true" viewBox="0 0 220 120" className="w-full max-w-[240px]" {...inView}>
      <motion.g variants={{ hidden: { x: -30, opacity: 0, rotate: 0 }, show: { x: 0, opacity: 1, rotate: -8, transition: { duration: 0.6 } } }}>
        <rect x="10" y="30" width="96" height="60" rx="8" fill="#F5F5F0" stroke="#0E1116" strokeWidth="2" />
        <text x="58" y="66" textAnchor="middle" fontFamily="var(--font-geist-mono)" fontSize="15" fill="#5B6070">INV-001</text>
      </motion.g>
      <motion.g variants={{ hidden: { x: 30, opacity: 0, rotate: 0 }, show: { x: 0, opacity: 1, rotate: 6, transition: { duration: 0.6, delay: 0.2 } } }}>
        <rect x="112" y="28" width="96" height="60" rx="8" fill="#0E1116" />
        <text x="160" y="64" textAnchor="middle" fontFamily="var(--font-geist-mono)" fontSize="15" fill="#C8F031">INV-002</text>
      </motion.g>
      <motion.g variants={{ hidden: { scale: 0 }, show: { scale: [0, 1.25, 1], transition: { delay: 0.6, duration: 0.5 } } }}>
        <motion.g animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 }}>
          <circle cx="196" cy="24" r="16" fill="#C8F031" stroke="#0E1116" strokeWidth="2" />
          <text x="196" y="29" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="800" fontSize="14" fill="#0E1116">+1</text>
        </motion.g>
      </motion.g>
    </motion.svg>
  );
}

/** Card + bank building. */
export function PaymentIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 230 120" className="w-full max-w-[240px]">
      <Float amp={6} duration={3.6}>
        <g transform="rotate(-10 80 70)">
          <rect x="20" y="30" width="130" height="80" rx="12" fill="#0E1116" />
          <rect x="20" y="50" width="130" height="14" fill="#2A303C" />
          <rect x="34" y="80" width="40" height="8" rx="3" fill="#C8F031" />
        </g>
      </Float>
      <g transform="translate(140 18)">
        <motion.path d="M0 34 L40 10 L80 34 Z" fill="#C8F031" stroke="#0E1116" strokeWidth="2.5" strokeLinejoin="round" initial={{ y: -16, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.6 }} />
        <rect x="8" y="38" width="64" height="8" fill="#0E1116" />
        {[14, 36, 58].map((x, i) => (
          <motion.rect key={x} x={x} y="48" width="8" height="34" fill="#0E1116" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.12 }} style={{ originY: 1 }} />
        ))}
        <rect x="4" y="84" width="72" height="8" fill="#0E1116" />
      </g>
    </svg>
  );
}

/** Folder of client cards fanning out. */
export function ClientsIllustration() {
  return (
    <motion.svg aria-hidden="true" viewBox="0 0 220 120" className="w-full max-w-[240px]" {...inView}>
      <path d="M20 30 h50 l12 12 h118 v70 h-180 z" fill="#0E1116" />
      <motion.rect x="36" y="10" width="120" height="70" rx="6" fill="#FFFFFF" stroke="#0E1116" strokeWidth="2" variants={{ hidden: { y: 30, rotate: 0 }, show: { y: 0, rotate: -4, transition: { duration: 0.6 } } }} />
      <motion.rect x="60" y="18" width="120" height="70" rx="6" fill="#C8F031" stroke="#0E1116" strokeWidth="2" variants={{ hidden: { y: 30, rotate: 0 }, show: { y: 0, rotate: 5, transition: { duration: 0.6, delay: 0.15 } } }} />
      <path d="M20 54 h180 v58 h-180 z" fill="#1C212B" />
      <circle cx="56" cy="82" r="10" fill="#C8F031" />
      <rect x="74" y="76" width="70" height="6" rx="3" fill="#5B6070" />
      <rect x="74" y="88" width="44" height="6" rx="3" fill="#3A4150" />
    </motion.svg>
  );
}

/** Line-art globe, slowly turning. */
export function Globe({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 400" className={className}>
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} fill="none" stroke="#0E1116" strokeOpacity=".16" strokeWidth="1.5">
        <circle cx="200" cy="200" r="180" />
        <ellipse cx="200" cy="200" rx="60" ry="180" />
        <ellipse cx="200" cy="200" rx="120" ry="180" />
        <path d="M20 200h360M40 110h320M40 290h320M90 50h220M90 350h220" />
      </motion.g>
      <Sparkle x={340} y={70} size={12} />
      <Sparkle x={60} y={330} size={9} delay={1} />
    </svg>
  );
}

/** Large paper plane for the CTA block. */
export function CtaPlane() {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" className="w-full">
      <motion.path
        d="M10 280 C 120 260, 160 160, 250 140 S 360 80, 380 30"
        fill="none"
        stroke="#0E1116"
        strokeWidth="2.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
      <motion.g
        initial={{ x: -120, y: 120, opacity: 0 }}
        whileInView={{ x: 0, y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1], delay: 0.4 }}
      >
        <motion.g animate={{ y: [0, -10, 0], rotate: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <g transform="translate(330 60) rotate(-35)">
            <path d="M-50 -30 L60 0 L-50 30 L-28 0 Z" fill="#0E1116" />
            <path d="M-28 0 L60 0" stroke="#C8F031" strokeWidth="3" />
            <path d="M-28 0 L-14 26 L4 6" fill="#3A4150" />
          </g>
        </motion.g>
      </motion.g>
    </svg>
  );
}
