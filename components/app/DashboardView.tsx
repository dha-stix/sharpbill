"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, EmptyState, PageLoader } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { CountUp, Stagger, StaggerItem } from "@/components/ui/Motion";
import { useAuth } from "@/context/AuthContext";
import { useClients, useInvoices } from "@/hooks/useData";
import { cn, firstName, formatCompact, formatMoney, shortName } from "@/lib/format";
import { countByClient, effectiveStatus } from "@/lib/invoice-utils";
import InvoiceTable from "./InvoiceTable";
import PageHeader from "./PageHeader";

const CURRENCY_KEY = "sharpbill-dashboard-currency";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardView() {
  const { profile } = useAuth();
  const { invoices, loading } = useInvoices();
  const { clients } = useClients();
  const baseCur = profile?.business.currency || "USD";

  // Every currency invoiced in: the business default first, then the rest by number of invoices.
  const currencies = useMemo(() => {
    const counts = new Map<string, number>();
    invoices.forEach((i) => counts.set(i.currency, (counts.get(i.currency) || 0) + 1));
    const others = [...counts.keys()].filter((c) => c !== baseCur).sort((a, b) => counts.get(b)! - counts.get(a)!);
    return [baseCur, ...others].map((code) => ({ code, count: counts.get(code) || 0 }));
  }, [invoices, baseCur]);

  // Totals are shown one currency at a time (never converted). The choice is remembered per browser.
  const [picked, setPicked] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CURRENCY_KEY);
    } catch {
      return null;
    }
  });
  const cur = picked && currencies.some((c) => c.code === picked) ? picked : baseCur;
  const pick = (code: string) => {
    setPicked(code);
    try {
      localStorage.setItem(CURRENCY_KEY, code);
    } catch {}
  };

  const stats = useMemo(() => {
    const now = new Date();
    const same = invoices.filter((i) => i.currency === cur);
    const open = same.filter((i) => ["SENT", "OVERDUE"].includes(effectiveStatus(i)));
    const overdue = same.filter((i) => effectiveStatus(i) === "OVERDUE");
    const paidThisMonth = same.filter((i) => {
      if (i.status !== "PAID" || !i.paidAt) return false;
      const d = new Date(i.paidAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + k, 1);
      const total = same
        .filter((i) => i.status === "PAID" && i.paidAt && new Date(i.paidAt).getMonth() === d.getMonth() && new Date(i.paidAt).getFullYear() === d.getFullYear())
        .reduce((s, i) => s + i.total, 0);
      return { label: d.toLocaleDateString("en-US", { month: "short" }), total, current: k === 5 };
    });
    const sum = (list: typeof same) => list.reduce((s, i) => s + i.total, 0);
    return {
      outstanding: sum(open),
      openCount: open.length,
      overdue: sum(overdue),
      overdueCount: overdue.length,
      paidMonth: sum(paidThisMonth),
      saved: same.filter((i) => i.status === "SAVED").length,
      months,
      max: Math.max(1, ...months.map((m) => m.total)),
      openList: invoices.filter((i) => effectiveStatus(i) !== "PAID").slice(0, 6),
    };
  }, [invoices, cur]);

  const invoiceCounts = useMemo(() => countByClient(invoices), [invoices]);
  const topClients = useMemo(() => [...clients].sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4), [clients]);
  const money = (n: number) => formatMoney(n, cur);

  if (loading) return <PageLoader />;

  const kpis = [
    { label: "Outstanding", value: stats.outstanding, note: `${stats.openCount} open invoice${stats.openCount === 1 ? "" : "s"}`, dark: true },
    { label: "Paid this month", value: stats.paidMonth, note: "Collected", tone: "text-[#1F6B42]" },
    { label: "Overdue", value: stats.overdue, note: `${stats.overdueCount} past due`, tone: "text-danger" },
    { label: "Saved, not sent", value: stats.saved, note: `Ready to send · ${cur}`, count: true },
  ];

  return (
    <div>
      <PageHeader
        title={
          // First name only; falls back to a shortened business name. Full name on hover.
          <span className="block max-w-full truncate" title={profile?.username || profile?.business.name}>
            {greeting()}, {firstName(profile?.username || "") || shortName(profile?.business.name || "", 24) || "there"}
          </span>
        }
        subtitle={
          <span title={profile?.business.name}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {profile?.business.name && <> · {shortName(profile.business.name, 24)}</>}
          </span>
        }
        actions={<Link href="/invoice/create" className="btn btn-ink"><Icon name="plus" /> New invoice</Link>}
      />

      {currencies.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted">Totals in</span>
          <div role="tablist" aria-label="Currency for totals" className="scrollbar-none flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1">
            {currencies.map((c) => (
              <button
                key={c.code}
                role="tab"
                aria-selected={cur === c.code}
                onClick={() => pick(c.code)}
                title={`${c.count} invoice${c.count === 1 ? "" : "s"} in ${c.code}`}
                className={cn("relative min-h-10 whitespace-nowrap rounded-xl px-3.5 text-sm transition-colors", cur === c.code ? "text-lime" : "text-slate hover:text-ink")}
              >
                {cur === c.code && <motion.span layoutId="dash-currency" className="absolute inset-0 rounded-xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative font-mono font-medium">
                  {c.code} <span className="ml-0.5 opacity-60">{c.count}</span>
                </span>
              </button>
            ))}
          </div>
          <span className="text-[13px] text-muted">Each currency is totalled on its own — nothing is converted.</span>
        </div>
      )}

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <StaggerItem key={k.label}>
            <motion.div whileHover={{ y: -4 }} className={cn("flex h-full flex-col gap-2.5 rounded-[20px] p-5", k.dark ? "bg-ink text-white" : "card")}>
              <span className={cn("text-sm", k.dark ? "text-soft" : "text-muted")}>{k.label}</span>
              <CountUp trigger="mount" value={k.value} format={(n) => (k.count ? Math.round(n).toString() : money(n))} className="font-display text-[32px] font-bold tracking-tight" />
              <span className={cn("text-[13px]", k.dark ? "text-lime" : k.tone ?? "text-muted")}>{k.note}</span>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card min-w-0 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Revenue collected</h2>
            <span className="text-sm text-muted">Last 6 months · {cur}</span>
          </div>
          <div className="mt-6 flex h-56 items-end gap-[clamp(10px,3vw,28px)] border-b border-line" role="img" aria-label="Bar chart of revenue collected per month">
            {stats.months.map((m, i) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="font-mono text-xs text-muted">{m.total ? formatCompact(m.total, cur) : ""}</span>
                <motion.div
                  key={cur}
                  className={cn("w-full max-w-14 rounded-t-[10px] rounded-b-sm", m.current ? "bg-lime" : "bg-ink")}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(2, (m.total / stats.max) * 85)}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease: [0.2, 0.7, 0.2, 1] }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex gap-[clamp(10px,3vw,28px)]">
            {stats.months.map((m) => <span key={m.label} className="flex-1 text-center text-[13px] text-muted">{m.label}</span>)}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card flex min-w-0 flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Top clients</h2>
            <Link href="/clients" className="text-sm text-muted hover:text-ink">View all</Link>
          </div>
          {topClients.length === 0 && <p className="text-sm text-muted">No clients yet. <Link href="/clients" className="font-medium text-ink underline">Add one</Link>.</p>}
          {topClients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="-mx-2 flex items-center gap-3 rounded-xl p-2 transition hover:bg-paper-2">
              <Avatar name={c.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{c.name}</span>
                <span className="text-[13px] text-muted">{invoiceCounts[c.id] || 0} invoice{(invoiceCounts[c.id] || 0) === 1 ? "" : "s"}</span>
              </span>
              <span className="font-mono font-medium">{formatCompact(c.totalBilled, c.currency)}</span>
            </Link>
          ))}
        </motion.section>
      </div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="font-display text-xl font-bold">Open invoices</h2>
          <Link href="/invoices" className="text-sm text-muted hover:text-ink">All invoices →</Link>
        </div>
        {stats.openList.length ? (
          <InvoiceTable invoices={stats.openList} columns={["number", "client", "due", "status", "amount"]} minWidth={640} />
        ) : (
          <div className="px-6 pb-6">
            <EmptyState title="Nothing outstanding" body="Every invoice is paid — or you haven’t created one yet." action={<Link href="/invoice/create" className="btn btn-lime">Create an invoice</Link>} />
          </div>
        )}
      </motion.section>
    </div>
  );
}
