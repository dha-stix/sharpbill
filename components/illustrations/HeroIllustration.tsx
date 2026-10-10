"use client";

import { motion } from "framer-motion";
import { Coins, Orbit, PlaneOnPath, Sparkle } from "./Primitives";

/** Backdrop for the homepage hero: lime disc, orbit, flying plane, coins, sparkles. */
export default function HeroIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 580" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
      <motion.circle
        cx="320"
        cy="290"
        r="236"
        fill="#C8F031"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.2 }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <Orbit cx={320} cy={290} r={276} />
      <PlaneOnPath d="M40 520 C 130 430, 110 300, 260 250 S 500 170, 580 40" duration={8} />
      <Coins x={86} y={440} />
      <Sparkle x={560} y={420} size={16} />
      <Sparkle x={120} y={110} size={12} delay={1.2} />
      <Sparkle x={500} y={530} size={9} delay={0.6} />
    </svg>
  );
}
