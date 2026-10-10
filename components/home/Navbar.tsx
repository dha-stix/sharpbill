"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/format";

const LINKS = [
  { href: "#demo", label: "Try it" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#templates", label: "Designs" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled ? "border-ink/10 bg-paper/80 backdrop-blur-xl" : "border-transparent bg-transparent"
      )}
    >
      <div className={cn("mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6", scrolled ? "py-3" : "py-5")}>
        <Logo />
        <nav className="hidden items-center gap-8 text-[15px] text-slate md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="group relative py-1 hover:text-ink">
              {l.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-ink transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn btn-ink btn-pill !min-h-11">Open dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link href="/auth/register" className="btn btn-ink btn-pill !min-h-11 max-[400px]:!px-4">Get started</Link>
            </>
          )}
          <button type="button" className="btn btn-ghost !px-2.5 md:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink/10 bg-paper md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col px-4 py-3">
              {LINKS.map((l, i) => (
                <motion.a key={l.href} href={l.href} onClick={() => setOpen(false)} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="py-3 font-display text-2xl font-bold">
                  {l.label}
                </motion.a>
              ))}
              {!user && <Link href="/auth/login" className="py-3 text-lg">Log in</Link>}
              {!user && <Link href="/auth/register" className="btn btn-lime mt-2">Get started</Link>}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
