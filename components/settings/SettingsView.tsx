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
import { emailJsFingerprint, hasEmailJsKeys, isEmailJsReady, verifyEmailJs } from "@/lib/email";
import { EMPTY_BANK, EMPTY_BUSINESS, EMPTY_EMAILJS } from "@/lib/constants";
import { saveBusinessProfile, saveEmailJsSettings, saveInvoiceSettings, savePaymentSettings } from "@/lib/firebase-actions";
import { cn } from "@/lib/format";
import { formatInvoiceNumber } from "@/lib/invoice-utils";
import type { BusinessProfile, EmailJsSettings, PaymentSettings, UserProfile } from "@/lib/types";
import type { User } from "firebase/auth";
import BusinessFields from "./BusinessFields";
import EmailTemplateGallery from "./EmailTemplateGallery";

const SECTIONS = [
  ["business", "Business profile"],
  ["account", "Account"],
  ["payment", "Payment methods"],
  ["emailjs", "Email sending"],
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
  const [ejs, setEjs] = useState<EmailJsSettings>(() => ({ ...EMPTY_EMAILJS, ...profile.emailjs }));
  const [ejsError, setEjsError] = useState("");
  // "Connected" means the saved keys passed a real test send; filled-in keys alone are not enough.
  const connected = isEmailJsReady(profile.emailjs);
  const needsCheck = !connected && hasEmailJsKeys(profile.emailjs);
  const ejsDirty = emailJsFingerprint(ejs) !== emailJsFingerprint({ ...EMPTY_EMAILJS, ...profile.emailjs });
  const testEmail = biz.email || user.email || "";

  function verifyAndSave() {
    setEjsError("");
    const keys = { ...ejs, serviceId: ejs.serviceId.trim(), templateId: ejs.templateId.trim(), publicKey: ejs.publicKey.trim() };
    if (!hasEmailJsKeys(keys)) return setEjsError("Enter your Service ID, Template ID and Public key.");
    if (!testEmail) return setEjsError("Add your business email above first — the test email is sent there.");
    return save(
      "ejs",
      async () => {
        try {
          await verifyEmailJs(keys, testEmail, biz.name || "SharpBill");
        } catch (e) {
          setEjsError((e as Error).message);
          throw e;
        }
        await saveEmailJsSettings({ ...keys, verifiedKeys: emailJsFingerprint(keys) });
        setEjs(keys);
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

          {/* EMAILJS */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard
              id="emailjs"
              title="Email sending (EmailJS)"
              description="Invoices are sent from your own EmailJS account (paid plan required). Keys are stored on your account only."
              aside={
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold", connected ? "bg-[#E2F3E8] text-[#1F6B42]" : needsCheck ? "bg-[#FFF1D6] text-[#8A5A00]" : "bg-[#FBE6E4] text-danger")}>
                  <span className="size-2 rounded-full bg-current" />
                  {connected ? "Connected" : needsCheck ? "Not verified" : "Not connected"}
                </span>
              }
            >
              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Service ID" className="font-mono" placeholder="service_xxx" value={ejs.serviceId} onChange={(e) => setEjs({ ...ejs, serviceId: e.target.value })} />
                <Input label="Template ID" className="font-mono" placeholder="template_xxx" value={ejs.templateId} onChange={(e) => setEjs({ ...ejs, templateId: e.target.value })} />
                <div className="label">
                  Public key
                  <div className="flex gap-2">
                    <input className="field font-mono" type={showKey ? "text" : "password"} value={ejs.publicKey} onChange={(e) => setEjs({ ...ejs, publicKey: e.target.value })} placeholder="Your public key" />
                    <button type="button" className="btn btn-outline !px-3" onClick={() => setShowKey((s) => !s)} aria-label={showKey ? "Hide key" : "Show key"}>
                      <Icon name={showKey ? "eyeOff" : "eye"} size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[13px] text-muted">
                <strong className="text-ink">A paid EmailJS plan (Personal or above) is required.</strong> Every invoice is emailed with its PDF attached, and EmailJS’s Free plan doesn’t allow attachments — so keys from a Free account won’t connect.
              </p>
              <ol className="mt-5 grid gap-2 rounded-2xl bg-paper p-4 text-sm text-slate sm:grid-cols-2">
                {[
                  "Create an account at emailjs.com on a paid plan (Personal or above) and connect an email service.",
                  "Create a template and paste one of the designs below (Code mode).",
                  "Set the template fields and attachment shown under “Invoice email designs” below.",
                  "Copy your Service ID, Template ID and Public key into the fields above.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink font-mono text-xs text-lime">{i + 1}</span>{s}</li>
                ))}
              </ol>
              {ejsError && (
                <p role="alert" className="mt-4 rounded-xl border border-[#F0C9C5] bg-[#FBE6E4] px-4 py-3 text-sm text-danger">{ejsError}</p>
              )}
              <p className="mt-4 text-[13px] text-muted">
                {connected && !ejsDirty
                  ? "These keys sent a test email with an attachment successfully."
                  : <>To confirm the keys are correct and the plan is paid, a test email with a PDF attached is sent through your EmailJS account to <strong className="text-ink">{testEmail}</strong>. They only show as connected if it goes through.</>}
              </p>
              <SaveButton busy={saving === "ejs"} onClick={verifyAndSave}>{connected && !ejsDirty ? "Verify again" : "Verify & save keys"}</SaveButton>
            </SectionCard>
          </motion.div>

          {/* EMAIL TEMPLATES */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <SectionCard id="email-templates" title="Invoice email designs" description="Six invoice-delivery emails, each matching an invoice design. Copy one into your EmailJS template — client, amount, due date, payment button and your message fill in automatically.">
              <EmailTemplateGallery />
            </SectionCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
