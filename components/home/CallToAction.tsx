"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CtaPlane } from "@/components/illustrations/FeatureIllustrations";
import { Icon } from "@/components/ui/Icon";
import { SplitText } from "@/components/ui/Motion";

/** Skewed lime CTA block with a flying plane, followed by the footer. */
export default function CallToAction() {
  return (
    <section className="px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 80, skewY: 0 }}
        whileInView={{ opacity: 1, y: 0, skewY: -3 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
        className="mx-auto mt-28 max-w-[1240px]"
      >
        <div className="relative overflow-hidden rounded-[36px] border-2 border-ink bg-lime px-[clamp(28px,6vw,80px)] py-[clamp(48px,8vw,100px)] shadow-hard-lg">
          <div className="pointer-events-none absolute -right-10 -top-5 w-[min(460px,70%)] skew-y-3 opacity-90">
            <CtaPlane />
          </div>
          <div className="relative flex max-w-[720px] skew-y-3 flex-col gap-7">
            <h2 className="font-display text-[clamp(2.75rem,6.5vw,5.75rem)] font-extrabold leading-[0.92] tracking-[-0.045em]">
              <SplitText text="Your next invoice is two minutes away." />
            </h2>
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link href="/auth/register" className="btn btn-ink btn-pill !min-h-[60px] !px-8 text-[17px]">Create free account <Icon name="arrowRight" /></Link>
              </motion.div>
              <Link href="/auth/login" className="btn btn-pill !min-h-[60px] border-2 !border-ink !px-7 text-[17px]">Log in</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
