"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebase-actions";
import { cn, shortName } from "@/lib/format";

export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/invoices", label: "Invoices", icon: "invoice", match: ["/invoice"] },
  { href: "/clients", label: "Clients", icon: "clients" },
  { href: "/templates", label: "Designs", icon: "templates" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="App">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href) || item.match?.some((m) => pathname.startsWith(m + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] transition-colors", active ? "font-semibold text-ink" : "text-soft hover:bg-ink-2 hover:text-white")}
          >
            {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-lime" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative"><Icon name={item.icon} /></span>
            <span className="relative">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NavFallback() {
  return (
    <nav className="flex flex-col gap-1" aria-label="App">
      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] text-soft">
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, user } = useAuth();
  const router = useRouter();
  const name = profile?.business?.name || profile?.username || "Your business";

  return (
    <div className="flex h-full flex-col gap-6 bg-ink px-4 py-6 text-white">
      <div className="px-1.5"><Logo variant="light" href="/dashboard" /></div>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Link href="/invoice/create" onClick={onNavigate} className="btn btn-lime w-full !min-h-12">
          <Icon name="plus" strokeWidth={2.4} /> New invoice
        </Link>
      </motion.div>
      <Suspense fallback={<NavFallback />}>
        <NavLinks onNavigate={onNavigate} />
      </Suspense>
      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-ink-2 p-3">
        <Avatar name={name} src={profile?.business?.logo} size={38} className="!bg-lime" />
        <div className="min-w-0 flex-1 text-sm">
          <div className="truncate font-semibold" title={name}>{shortName(name, 20)}</div>
          <div className="truncate text-[13px] text-[#9AA0AC]">{user?.email}</div>
        </div>
        <button
          type="button"
          aria-label="Log out"
          title="Log out"
          onClick={async () => {
            await logout();
            router.replace("/auth/login");
          }}
          className="grid size-9 place-items-center rounded-lg text-soft transition hover:bg-ink-3 hover:text-white"
        >
          <Icon name="logout" size={17} />
        </button>
      </div>
    </div>
  );
}
