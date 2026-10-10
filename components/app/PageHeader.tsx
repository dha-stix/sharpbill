"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  actions,
  crumbs,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  crumbs?: { href: string; label: string }[];
}) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          {crumbs.map((c, i) => (
            <span key={c.href}>
              {i > 0 && " / "}
              <Link href={c.href} className="hover:text-ink">{c.label}</Link>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="min-w-0 max-w-full">
          <h1 className="font-display text-[clamp(1.75rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">{title}</h1>
          {subtitle && <div className="mt-1 text-muted">{subtitle}</div>}
        </motion.div>
        {actions && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="flex flex-wrap items-center gap-2">
            {actions}
          </motion.div>
        )}
      </div>
    </div>
  );
}
