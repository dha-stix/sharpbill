"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

const COLUMNS = [
  { title: "Product", links: [["Features", "#features"], ["Designs", "#templates"], ["How it works", "#how"]] },
  { title: "Account", links: [["Sign up", "/auth/register"], ["Log in", "/auth/login"]] },
  { title: "Legal", links: [["Privacy", "#"], ["Terms", "#"]] },
];

export default function Footer() {
  // Read the clock on the client only so the prerendered shell stays static.
  const year = useSyncExternalStore(noopSubscribe, () => new Date().getFullYear(), () => null);
  return (
    <footer className="mx-auto mt-36 max-w-[1240px] px-4 pb-8 sm:px-6">
      <div className="flex flex-wrap justify-between gap-8 border-b border-line-2 pb-8">
        <p className="max-w-[320px] leading-relaxed text-[#4A5060]">Invoicing for freelancers and small studios. Create, send, download, get paid.</p>
        <nav className="flex flex-wrap gap-12 text-[15px]" aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <strong className="text-[13px] font-medium text-muted">{col.title}</strong>
              {col.links.map(([label, href]) => (
                <Link key={label} href={href} className="hover:underline">{label}</Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <div aria-hidden="true" className="overflow-hidden">
        <motion.div
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="outline-text mt-6 whitespace-nowrap font-display text-[clamp(5rem,19vw,17.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em]"
        >
          SharpBill
        </motion.div>
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm text-muted">
        <span>© {year ?? ""} SharpBill · Made for people who bill by the project.</span>
        <span>
          Built by{" "}
          <a
            href="https://www.linkedin.com/in/david-asaolu234/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
          >
            David Asaolu
          </a>
        </span>
      </div>
    </footer>
  );
}
