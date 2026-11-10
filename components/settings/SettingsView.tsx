"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import PageHeader from "@/components/app/PageHeader";
import { CopyButton, Input, SectionCard, Spinner } from "@/components/ui/Bits";
import { GoogleIcon, Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import BankFields from "@/components/invoice/BankFields";
import { bankText } from "@/lib/invoice-utils";
import { hasZernioKeys, isZernioReady, listGmailAccounts, verifyZernio, zernioFingerprint } from "@/lib/email";
import { EMPTY_BANK, EMPTY_BUSINESS, EMPTY_ZERNIO } from "@/lib/constants";
import { saveBusinessProfile, saveEmailDesign, saveInvoiceSettings, savePaymentSettings, saveZernioSettings } from "@/lib/firebase-actions";
import { cn } from "@/lib/format";
import { formatInvoiceNumber } from "@/lib/invoice-utils";
import type { BusinessProfile, PaymentSettings, UserProfile, ZernioSettings } from "@/lib/types";
import type { User } from "firebase/auth";
import BusinessFields from "./BusinessFields";
import EmailTemplateGallery from "./EmailTemplateGallery";

const SECTIONS = [
  ["business", "Business profile"],
  ["account", "Account"],
  ["payment", "Payment methods"],
  ["email", "Email sending"],
  ["email-templates", "Email designs"],
];

/** Wraps a save action with a spinner + toast. */
function useSaver() {
  const toast = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const save = async (key: string, fn: () => Promise<unknown>, msg: string) => {
    setSaving(key);
    try {
      await fn();
      toast(msg);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(null);
    }
  };
  return { saving, save };
}

function SaveButton({ busy, onClick, children = "Save changes" }: { busy: boolean; onClick: () => void; children?: ReactNode }) {
  return (
    <div className="mt-6 flex justify-end">
      <button type="button" className="btn btn-ink" disabled={busy} onClick={onClick}>{busy && <Spinner />} {children}</button>
    </div>
  );
}

export default function SettingsView() {
  const { profile, user } = useAuth();
  // AppShell only renders pages once the profile has loaded.
  if (!profile || !user) return null;
  return <SettingsForm profile={profile} user={user} />;
}

function SettingsForm({ profile, user }: { profile: UserProfile; user: User }) {
  const { saving, save } = useSaver();
  const [biz, setBiz] = useState<BusinessProfile>(() => ({ ...EMPTY_BUSINESS, ...profile.business, address: { ...EMPTY_BUSINESS.address, ...profile.business.address } }));
  const [prefix, setPrefix] = useState(profile.invoicePrefix || "INV-");
  const [dueDays, setDueDays] = useState(profile.defaultDueDays ?? 14);
  const [pay, setPay] = useState<PaymentSettings>(() => ({ ...profile.payment, bank: { ...EMPTY_BANK, ...profile.payment?.bank } }));
  const [zr, setZr] = useState<ZernioSettings>(() => ({ ...EMPTY_ZERNIO, ...profile.zernio }));
  const [zrError, setZrError] = useState("");
  const [accounts, setAccounts] = useState<{ id: string; label: string; canSend: boolean }[] | null>(null);
  const [finding, setFinding] = useState(false);
  // "Connected" means the saved key + account sent a real test email; filled-in values alone are not enough.
  const connected = isZernioReady(profile.zernio);
  const needsCheck = !connected && hasZernioKeys(profile.zernio);
  const zrDirty = zernioFingerprint(zr) !== zernioFingerprint({ ...EMPTY_ZERNIO, ...profile.zernio });
  const testEmail = biz.email || user.email || "";

  /** Loads the Gmail mailboxes connected to this Zernio key; picks it automatically when there is only one. */
  async function findAccounts() {
    setZrError("");
    if (!zr.apiKey.trim()) return setZrError("Enter your Zernio API key first.");
    setFinding(true);
    try {
      const all = await listGmailAccounts(zr.apiKey);
      const list = all.filter((a) => a.canSend);
      setAccounts(list);
      if (!all.length) setZrError("No Google account is connected to this Zernio key yet. Connect your Gmail in Zernio (with Email access), then try again.");
      else if (!list.length) setZrError("Your Google account is connected to Zernio without Email access. Reconnect it in Zernio and allow Email, then try again.");
      else if (list.length === 1) setZr((z) => ({ ...z, accountId: list[0].id, mailbox: list[0].label }));
    } catch (e) {
      setZrError((e as Error).message);
    } finally {
      setFinding(false);
    }
  }

  function verifyAndSave() {
    setZrError("");
    const keys: ZernioSettings = { ...zr, apiKey: zr.apiKey.trim(), accountId: zr.accountId.trim() };
    if (!hasZernioKeys(keys)) return setZrError("Enter your Zernio API key and choose your Gmail account.");
    if (!testEmail) return setZrError("Add your business email above first — the test email is sent there.");
    return save(
      "zernio",
      async () => {
        try {
          await verifyZernio(keys, testEmail, biz.name || "SharpBill", profile.emailDesign);
        } catch (e) {
          setZrError((e as Error).message);
          throw e;
        }
        await saveZernioSettings({ ...keys, verifiedKeys: zernioFingerprint(keys) });
        setZr(keys);
      },
      `Connected — test email sent to ${testEmail}`,
    );
  }
  const [showKey, setShowKey] = useState(false);

  const bankDetails = bankText(pay.bank);
  const provider = user.providerData[0]?.providerId === "google.com" ? "Google" : "Email & password";

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your business details, payment methods and email sending." />

      <div className="grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="scrollbar-none flex gap-1 overflow-x-auto lg:sticky lg:top-6 lg:flex-col">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm text-slate transition hover:bg-white hover:text-ink">{label}</a>
          ))}
        </nav>

        <motion.div className="flex min-w-0 flex-col gap-5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
          {/* BUSINESS */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard id="business" title="Business profile" description="Issuer details printed on every invoice. They’re locked on the invoice form — edit them here.">
              <BusinessFields value={biz} onChange={setBiz} />
              <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
                <Input label="Invoice prefix" className="font-mono" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
                <Input label="Next invoice number" readOnly value={formatInvoiceNumber(prefix, (profile.invoiceCounter || 0) + 1)} className="font-mono" />
                <Input label="Default due (days)" type="number" min={0} value={dueDays} onChange={(e) => setDueDays(Number(e.target.value) || 0)} />
              </div>
              <SaveButton
                busy={saving === "biz"}
                onClick={() => save("biz", () => Promise.all([saveBusinessProfile(biz), saveInvoiceSettings({ invoicePrefix: prefix || "INV-", defaultDueDays: dueDays })]), "Business profile saved")}
              >
                Save profile
              </SaveButton>
            </SectionCard>
          </motion.div>

          {/* ACCOUNT */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard id="account" title="Account">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="label">
                  Account ID
                  <div className="flex gap-2">
                    <input className="field font-mono" readOnly value={user.uid} />
                    <CopyButton value={user.uid} />
                  </div>
                </div>
                <Input label="Login email" readOnly value={user.email || ""} />
              </div>
              <div className="mt-4 flex items-center gap-2.5 text-sm text-muted">
                {provider === "Google" ? <GoogleIcon size={18} /> : <Icon name="mail" />} Signed in with {provider}
              </div>
            </SectionCard>
          </motion.div>

          {/* PAYMENT */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard id="payment" title="Payment methods" description="The default fills every new invoice. You can switch or override it on each invoice.">
              <div className="grid gap-4 md:grid-cols-2">
                {(["link", "bank"] as const).map((type) => {
                  const active = pay.default === type;
                  return (
                    <motion.div key={type} layout className={cn("relative flex flex-col gap-3.5 rounded-2xl border-[1.5px] p-5 transition-colors", active ? "border-ink bg-[#FAFBEA]" : "border-line")}>
                      <div className="flex items-center justify-between">
                        <strong className="flex items-center gap-2"><Icon name={type === "link" ? "link" : "bank"} /> {type === "link" ? "Payment link" : "Bank transfer"}</strong>
                        <button type="button" aria-pressed={active} onClick={() => setPay((p) => ({ ...p, default: type }))} className={cn("btn !min-h-8 !px-3 text-[13px]", active ? "btn-ink" : "btn-outline")}>
                          {active ? "★ Default" : "Make default"}
                        </button>
                      </div>
                      {type === "link" ? (
                        <Input label="URL" type="url" className="font-mono" placeholder="https://pay.example.com/you" value={pay.link} onChange={(e) => setPay((p) => ({ ...p, link: e.target.value }))} hint="Stripe, Paystack, PayPal.me or any checkout link." />
                      ) : (
                        <>
                          <BankFields value={pay.bank} onChange={(bank) => setPay((p) => ({ ...p, bank }))} />
                          {bankDetails && <CopyButton value={bankDetails} label="Copy bank details" />}
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <SaveButton busy={saving === "pay"} onClick={() => save("pay", () => savePaymentSettings(pay), "Payment methods saved")} />
            </SectionCard>
          </motion.div>

          {/* EMAIL SENDING (ZERNIO) */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard
              id="email"
              title="Email sending (Zernio)"
              description="Invoices are sent from your own Gmail through your own Zernio account. Your key is stored on your SharpBill account only."
              aside={
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold", connected ? "bg-[#E2F3E8] text-[#1F6B42]" : needsCheck ? "bg-[#FFF1D6] text-[#8A5A00]" : "bg-[#FBE6E4] text-danger")}>
                  <span className="size-2 rounded-full bg-current" />
                  {connected ? "Connected" : needsCheck ? "Not verified" : "Not connected"}
                </span>
              }
            >
              <ol className="mb-5 grid gap-2 rounded-2xl bg-paper p-4 text-sm text-slate sm:grid-cols-2">
                {[
                  "Create an account at zernio.com and add a payment method (Zernio requires one before sending Gmail emails).",
                  "In Zernio, connect your Google account and allow Email access.",
                  "Create a Zernio API key and paste it below.",
                  "Click “Find my Gmail” to pick the mailbox, then verify.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-lime">{i + 1}</span>{s}</li>
                ))}
              </ol>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="label">
                  Zernio API key
                  <div className="flex gap-2">
                    <input className="field font-mono" type={showKey ? "text" : "password"} autoComplete="off" value={zr.apiKey} onChange={(e) => setZr({ ...zr, apiKey: e.target.value })} placeholder="Your Zernio API key" />
                    <button type="button" className="btn btn-outline !px-3" onClick={() => setShowKey((s) => !s)} aria-label={showKey ? "Hide key" : "Show key"}>
                      <Icon name={showKey ? "eyeOff" : "eye"} size={16} />
                    </button>
                  </div>
                </div>
                <div className="label">
                  Gmail account
                  <div className="flex gap-2">
                    {accounts && accounts.length > 1 ? (
                      <select
                        className="field min-w-0 flex-1"
                        value={zr.accountId}
                        onChange={(e) => setZr({ ...zr, accountId: e.target.value, mailbox: accounts.find((a) => a.id === e.target.value)?.label })}
                      >
                        <option value="">Choose a mailbox…</option>
                        {accounts.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    ) : (
                      <input className="field font-mono" value={zr.accountId} onChange={(e) => setZr({ ...zr, accountId: e.target.value, mailbox: "" })} placeholder="Zernio account ID" />
                    )}
                    <button type="button" className="btn btn-outline shrink-0" disabled={finding} onClick={findAccounts}>
                      {finding ? <Spinner /> : <Icon name="search" size={16} />} Find my Gmail
                    </button>
                  </div>
                  {zr.mailbox && zr.mailbox !== zr.accountId && <span className="text-xs font-normal text-muted">Sends from {zr.mailbox}</span>}
                </div>
              </div>
              {zrError && (
                <p role="alert" className="mt-4 rounded-xl border border-[#F0C9C5] bg-[#FBE6E4] px-4 py-3 text-sm text-danger">{zrError}</p>
              )}
              <p className="mt-4 text-[13px] text-muted">
                {connected && !zrDirty
                  ? `Connected${profile.zernio?.mailbox ? ` — invoices are sent from ${profile.zernio.mailbox}` : ""}. Gmail allows 200 emails a day (500 on Google Workspace).`
                  : <>To confirm everything works, a test email with a PDF attached is sent from your Gmail to <strong className="text-ink">{testEmail}</strong>. It only shows as connected if the email goes through.</>}
              </p>
              <SaveButton busy={saving === "zernio"} onClick={verifyAndSave}>{connected && !zrDirty ? "Verify again" : "Verify & save"}</SaveButton>
            </SectionCard>
          </motion.div>

          {/* EMAIL TEMPLATES */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard id="email-templates" title="Invoice email design" description="Choose how your invoice emails look. The client’s name, amount, due date, payment button and your message are filled in automatically.">
              <EmailTemplateGallery selected={profile.emailDesign} onSelect={(id) => save("design", () => saveEmailDesign(id), "Email design saved")} />
            </SectionCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
