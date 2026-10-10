"use client";

import { motion, useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef } from "react";

const SPARKLE = "M0 -1 C.13 -.27 .27 -.13 1 0 C.27 .13 .13 .27 0 1 C-.13 .27 -.27 .13 -1 0 C-.27 -.13 -.13 -.27 0 -1Z";

/** Four-point twinkling star. */
export function Sparkle({ x, y, size = 14, fill = "#0E1116", delay = 0 }: { x: number; y: number; size?: number; fill?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <motion.path
        d={SPARKLE}
        fill={fill}
        animate={{ scale: [1, 0.55, 1], opacity: [1, 0.35, 1], rotate: [0, 45, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }}
      />
    </g>
  );
}

/** Paper plane glyph centered on the origin, pointing right. */
export function PlaneShape({ scale = 1, body = "#0E1116", accent = "#C8F031" }: { scale?: number; body?: string; accent?: string }) {
  return (
    <g transform={`scale(${scale})`}>
      <path d="M-22 -14 L26 0 L-22 14 L-12 0 Z" fill={body} />
      <path d="M-12 0 L26 0" stroke={accent} strokeWidth="2.5" />
      <path d="M-12 0 L-6 12 L2 3" fill={body} opacity=".75" />
    </g>
  );
}

/**
 * Flies children along an SVG path forever, rotating to follow the curve.
 * Also draws the dotted trail itself.
 */
export function PlaneOnPath({
  d,
  duration = 8,
  trail = "#0E1116",
  trailOpacity = 1,
  body,
  accent,
  scale = 1,
}: {
  d: string;
  duration?: number;
  trail?: string;
  trailOpacity?: number;
  body?: string;
  accent?: string;
  scale?: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const reduce = useReducedMotion();

  useAnimationFrame((time) => {
    const path = pathRef.current;
    const plane = planeRef.current;
    if (!path || !plane) return;
    const len = path.getTotalLength();
    const t = reduce ? 0.55 : ((time / 1000) % duration) / duration;
    const p = path.getPointAtLength(t * len);
    const q = path.getPointAtLength(Math.min(len, t * len + 1));
    const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    // fade at both ends of the loop
    const fade = Math.min(1, t * 12, (1 - t) * 12);
    plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
    plane.setAttribute("opacity", String(fade));
  });

  return (
    <g>
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={trail}
        strokeOpacity={trailOpacity}
        strokeWidth="2.2"
        strokeDasharray="1 10"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <g ref={planeRef}>
        <PlaneShape scale={scale} body={body} accent={accent} />
      </g>
    </g>
  );
}

/** Slowly spinning dashed ring with satellite dots. */
export function Orbit({ cx, cy, r, stroke = "#0E1116", duration = 60, dots = true }: { cx: number; cy: number; r: number; stroke?: string; duration?: number; dots?: boolean }) {
  return (
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 11" strokeLinecap="round" />
      {dots && (
        <>
          <circle cx={cx + r} cy={cy} r="7" fill={stroke} />
          <circle cx={cx - r} cy={cy} r="4.5" fill={stroke} />
        </>
      )}
    </motion.g>
  );
}

/** Stack of three coins that bounce in sequence. */
export function Coins({ x, y, top = "#C8F031" }: { x: number; y: number; top?: string }) {
  const coin = (dy: number, dx: number, face: string, i: number) => (
    <motion.g
      key={i}
      initial={{ y: -60, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.3 + (2 - i) * 0.15 }}
    >
      <ellipse cx={dx} cy={dy + 12} rx="40" ry="12" fill="#0E1116" />
      <rect x={dx - 40} y={dy} width="80" height="12" fill="#0E1116" />
      <ellipse cx={dx} cy={dy} rx="40" ry="12" fill={face} stroke="#0E1116" strokeWidth="2.5" />
    </motion.g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {coin(46, 0, "#FFFFFF", 0)}
      {coin(22, 6, "#FFFFFF", 1)}
      {coin(-2, 0, top, 2)}
      <text x="0" y="4" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="800" fontSize="16" fill="#0E1116">$</text>
    </g>
  );
}

/** Generic floating wrapper for SVG groups. */
export function Float({ children, amp = 8, duration = 4, delay = 0 }: { children: React.ReactNode; amp?: number; duration?: number; delay?: number }) {
  return (
    <motion.g animate={{ y: [0, -amp, 0] }} transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}>
      {children}
    </motion.g>
  );
}
