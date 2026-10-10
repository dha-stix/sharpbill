"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import ClientFormDrawer from "@/components/clients/ClientFormDrawer";
import DesignGallery from "@/components/templates/DesignGallery";
import { SHARED_FIELDS, TEMPLATES } from "@/components/templates/registry";
import ScaledDocument from "@/components/templates/ScaledDocument";
import { CurrencySelect, Input, PageLoader, Select, SectionCard, Spinner, Textarea } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { CountUp } from "@/components/ui/Motion";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { useClients } from "@/hooks/useData";
import { EMPTY_BANK } from "@/lib/constants";
import { createInvoice, updateInvoice } from "@/lib/firebase-actions";
import { addDays, addressLines, cn, formatMoney, toISODate } from "@/lib/format";
import { computeTotals, formatInvoiceNumber, formatOrderNumber } from "@/lib/invoice-utils";
import type { Invoice, InvoiceDraft, InvoicePayment, LineItem, TemplateId } from "@/lib/types";
import LineItemsEditor, { newItem } from "./LineItemsEditor";
import PaymentPicker from "./PaymentPicker";
import SendInvoiceModal from "./SendInvoiceModal";
import { OffscreenDocument, useInvoicePdf } from "./usePdf";

/** Creates a new invoice, or edits `existing` (an invoice that hasn't been paid). */
export default function InvoiceEditor({ existing }: { existing?: Invoice }) {
  const params = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const { profile } = useAuth();
  const { clients, loading } = useClients();
  const { ref: pdfRef, make: makePdf } = useInvoicePdf();

  const initialTemplate = params.get("template") as TemplateId | null;
  const [step, setStep] = useState<"template" | "details">(existing || (initialTemplate && TEMPLATES[initialTemplate]) ? "details" : "template");
  const [template, setTemplate] = useState<TemplateId>(existing?.template ?? (initialTemplate && TEMPLATES[initialTemplate] ? initialTemplate : "standard"));
  const [clientId, setClientId] = useState(existing?.clientId ?? (params.get("client") || ""));
  const today = toISODate(new Date());
  // An invoice is always issued on the day it is created, and keeps that date when edited.
  const issueDate = existing?.issueDate ?? today;
  const [dueDate, setDueDate] = useState(existing?.dueDate ?? addDays(today, profile?.defaultDueDays ?? 14));
  const [currencyOverride, setCurrency] = useState<string | null>(existing?.currency ?? null);
  const [items, setItems] = useState<LineItem[]>(existing?.items.length ? existing.items : [newItem()]);
  const [taxRate, setTaxRate] = useState(existing?.taxRate ?? 0);
  const [notes, setNotes] = useState(existing ? existing.notes : "Thank you for your business.");
  const [extra, setExtra] = useState<Record<string, string>>(existing?.extra ?? {});
  const [payment, setPayment] = useState<InvoicePayment>(
    existing
      ? { ...existing.payment, bank: { ...EMPTY_BANK, ...existing.payment.bank } }
      : { type: profile?.payment.default ?? "link", link: profile?.payment.link ?? "", bank: profile?.payment.bank ?? EMPTY_BANK },
  );
  const [busy, setBusy] = useState<"save" | "send" | null>(null);
  const [saved, setSaved] = useState<Invoice | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [addClient, setAddClient] = useState(false);

  const meta = TEMPLATES[template];
  const client = clients.find((c) => c.id === clientId) ?? null;
  // When editing, fall back to the client details stored on the invoice (the client may have been deleted since).
  const billTo = client ?? existing?.client ?? null;

  // Defaults to the client's billing currency; the user can override it.
  const currency = currencyOverride ?? client?.currency ?? profile?.business.currency ?? "USD";

  const totals = computeTotals(items, taxRate, 0);

  const draft: InvoiceDraft | null = useMemo(() => {
    if (!profile) return null;
    const c = billTo ?? { id: "", name: "Select a client", contactName: "", email: "", phone: "", address: { street: "", city: "", state: "", postalCode: "", country: "" }, taxId: "", currency };
    return {
      clientId: existing?.clientId ?? c.id,
      client: { id: c.id, name: c.name, contactName: c.contactName, email: c.email, phone: c.phone, address: c.address, taxId: c.taxId, currency: c.currency },
      business: profile.business,
      template,
      currency,
      issueDate,
      dueDate,
      items,
      taxRate,
      shipping: 0,
      notes,
      payment,
      extra,
    };
  }, [profile, billTo, existing, template, currency, issueDate, dueDate, items, taxRate, notes, payment, extra]);

  const preview: Invoice | null = draft && profile
    ? {
        ...draft,
        id: existing?.id ?? "preview",
        number: existing?.number ?? formatInvoiceNumber(profile.invoicePrefix, (profile.invoiceCounter || 0) + 1),
        seq: existing?.seq ?? (profile.invoiceCounter || 0) + 1,
        clientOrderNumber: existing?.clientOrderNumber ?? (client?.invoiceCount || 0) + 1,
        ...totals,
        status: existing?.status ?? "SAVED",
      }
    : null;

  if (loading || !profile || !preview || !draft) return <PageLoader />;

  function validate() {
    if (!billTo) return "Choose a client to bill.";
    if (!items.some((i) => i.description.trim())) return "Add at least one line item.";
    // An overdue invoice may keep its original due date while other details are edited.
    if (!dueDate || (dueDate < today && dueDate !== existing?.dueDate)) return "Choose a due date that is today or later.";
    return null;
  }

  async function save(mode: "save" | "send") {
    const error = validate();
    if (error) return toast(error, "error");
    setBusy(mode);
    try {
      const cleaned = { ...draft!, items: items.filter((i) => i.description.trim()) };
      const inv = existing ? await updateInvoice(existing.id, cleaned) : await createInvoice(cleaned, "SAVED");
      setSaved(inv);
      if (existing && mode === "save") {
        toast(`${inv.number} updated`);
        router.push(`/invoice/${inv.id}`);
      } else if (mode === "save") {
        const pdf = await makePdf(inv.number);
        pdf.save();
        toast(`${inv.number} saved and downloaded`);
        router.push(`/invoice/${inv.id}`);
      } else {
        setSendOpen(true);
      }
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(null);
    }
  }

  /* ---------- step 1: template ---------- */
  if (step === "template")
    return (
      <div>
        <PageHeader title={existing ? `Edit ${existing.number}` : "New invoice"} subtitle={existing ? "Choose a design for this invoice." : "Step 1 of 2 — choose a design. Every design uses the same simple form; you can switch any time."} />
        <DesignGallery
          selected={template}
          onSelect={(id) => {
            setTemplate(id);
            setStep("details");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    );

  /* ---------- step 2: details ---------- */
  return (
    <div className="pb-28">
      <PageHeader
        crumbs={existing ? [{ href: "/invoices", label: "Invoices" }, { href: `/invoice/${existing.id}`, label: existing.number }] : undefined}
        title={existing ? `Edit ${existing.number}` : "New invoice"}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {existing ? (existing.sentAt ? "Already sent — send it again after saving so your client has the new version ·" : "Editing ·") : "Step 2 of 2 ·"} <strong className="text-ink">{meta.name}</strong> design
            <button type="button" onClick={() => setStep("template")} className="text-sm underline underline-offset-2 hover:text-ink">Change</button>
          </span>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard title="Parties">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate">
                  From
                  <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2 py-0.5 text-xs text-muted"><Icon name="lock" size={12} /> Locked</span>
                </div>
                <div className="rounded-xl border-[1.5px] border-dashed border-line-2 bg-paper-2 p-3.5 text-sm leading-relaxed text-slate">
                  <strong className="text-ink">{profile.business.name}</strong>
                  {addressLines(profile.business.address).map((l) => <div key={l}>{l}</div>)}
                  <div>{profile.business.email}</div>
                  <Link href="/settings#business" className="mt-1 inline-block text-xs underline">Edit in Settings</Link>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Select
                  label="Bill to"
                  value={clientId}
                  disabled={!!existing}
                  hint={existing ? "The client can’t be changed on an existing invoice." : undefined}
                  onChange={(e) => {
                    if (e.target.value === "__new") return setAddClient(true);
                    setClientId(e.target.value);
                    setCurrency(null);
                  }}
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {existing && !client && <option value={existing.clientId}>{existing.client.name}</option>}
                  {!existing && <option value="__new">+ Add new client</option>}
                </Select>
                <AnimatePresence>
                  {client && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-between gap-3 text-[13px] text-muted">
                      <span className="truncate">{client.email}</span>
                      <span className="font-mono text-ink">Order {formatOrderNumber(existing?.clientOrderNumber ?? client.invoiceCount + 1)}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Invoice details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input label="Invoice number" value={preview.number} readOnly className="font-mono" hint={existing ? "Never changes" : "Assigned on save"} />
              <Input label="Issue date" type="date" value={issueDate} readOnly tabIndex={-1} className="[&_input]:cursor-not-allowed [&_input]:bg-paper [&_input]:text-muted" hint={existing ? "The day it was created." : "Always today’s date."} />
              <Input label="Due date" type="date" min={today} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <CurrencySelect value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {SHARED_FIELDS.map((f) => (
                <Input key={f.key} label={f.label} placeholder={f.placeholder} value={extra[f.key] ?? ""} onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Line items" aside={<span className="text-sm text-muted">{items.length} item{items.length === 1 ? "" : "s"}</span>}>
            <LineItemsEditor items={items} onChange={setItems} meta={meta} currency={currency} />
            <div className="mt-6 flex justify-end">
              <div className="flex w-full max-w-xs flex-col gap-2.5 text-[15px]">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-mono">{formatMoney(totals.subtotal, currency)}</span></div>
                <label className="flex items-center justify-between gap-3">
                  <span className="text-muted">Tax %</span>
                  <input type="number" min={0} step="any" className="field !min-h-9 !w-24 text-right font-mono" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} />
                </label>
                <div className="flex items-baseline justify-between border-t border-line pt-2.5">
                  <span className="font-semibold">{meta.totalLabel}</span>
                  <span className="font-display text-2xl font-extrabold">{formatMoney(totals.total, currency)}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payment method" description="Defaults come from Settings — change them for this invoice only.">
            <PaymentPicker value={payment} onChange={setPayment} defaults={profile.payment} />
          </SectionCard>

          <SectionCard title="Notes">
            <Textarea label="Notes to client" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </SectionCard>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="eyebrow">Live preview · {meta.name}</span>
            <span className="text-xs text-muted">A4</span>
          </div>
          <motion.div layout className="overflow-hidden rounded-md bg-white shadow-[0_1px_0_#E2E2DA,0_30px_60px_-36px_rgba(14,17,22,.45)]">
            <AnimatePresence mode="wait">
              <motion.div key={template} initial={{ opacity: 0, rotateY: -12 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: 12 }} transition={{ duration: 0.35 }}>
                <ScaledDocument invoice={preview} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </aside>
      </div>

      {/* action bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.3 }}
        className="fixed inset-x-3 bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink py-3 pl-5 pr-3 text-white shadow-[0_20px_40px_-20px_rgba(14,17,22,.6)] lg:left-[264px] lg:right-6"
      >
        <span className="text-sm text-soft">
          Total{" "}
          <CountUp trigger="mount" value={totals.total} duration={0.4} format={(n) => formatMoney(n, currency)} className="ml-1.5 font-mono text-base font-semibold text-white" />
        </span>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={!!busy} onClick={() => save("save")} className={cn("btn border border-ink-4 text-white hover:bg-ink-3")}>
            {busy === "save" ? <Spinner /> : <Icon name={existing ? "check" : "download"} size={16} />} {existing ? "Save changes" : <>Save &amp; download PDF</>}
          </button>
          <button type="button" disabled={!!busy} onClick={() => save("send")} className="btn btn-lime">
            {busy === "send" ? <Spinner /> : <Icon name="send" size={16} />} {existing ? "Save & send" : "Send now"}
          </button>
        </div>
      </motion.div>

      <OffscreenDocument ref={pdfRef} invoice={saved} />
      <SendInvoiceModal
        invoice={saved}
        open={sendOpen}
        makePdf={makePdf}
        onClose={() => {
          setSendOpen(false);
          if (saved) router.push(`/invoice/${saved.id}`);
        }}
      />
      <ClientFormDrawer open={addClient} onClose={() => setAddClient(false)} onSaved={(id) => setClientId(id)} />
    </div>
  );
}
