"use client";

import { useState, type FormEvent } from "react";
import { CurrencySelect, Input, Spinner, Textarea } from "@/components/ui/Bits";
import { Drawer } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { EMPTY_ADDRESS } from "@/lib/constants";
import { createClient, updateClient } from "@/lib/firebase-actions";
import type { Address, Client, ClientInput } from "@/lib/types";

const blank = (currency: string): ClientInput => ({
  name: "",
  contactName: "",
  email: "",
  phone: "",
  address: EMPTY_ADDRESS,
  taxId: "",
  currency,
  notes: "",
});

type Props = {
  open: boolean;
  onClose: () => void;
  client?: Client | null;
  onSaved?: (id: string) => void;
};

/** Add / edit client drawer. Pass `client` to edit. Form state mounts fresh each time it opens. */
export default function ClientFormDrawer({ open, onClose, client, onSaved }: Props) {
  return (
    <Drawer open={open} onClose={onClose} title={client ? "Edit client" : "Add client"} subtitle={client ? client.name : "A business you invoice"}>
      <ClientForm client={client} onClose={onClose} onSaved={onSaved} />
    </Drawer>
  );
}

function initialForm(client: Client | null | undefined, currency: string): ClientInput {
  if (!client) return blank(currency);
  const { name, contactName, email, phone, address, taxId, notes } = client;
  return { name, contactName, email, phone, address: { ...EMPTY_ADDRESS, ...address }, taxId, currency: client.currency, notes: notes || "" };
}

function ClientForm({ client, onClose, onSaved }: Omit<Props, "open">) {
  const { profile } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState<ClientInput>(() => initialForm(client, profile?.business.currency || "USD"));
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ClientInput>(k: K, v: ClientInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setAddr = (k: keyof Address, v: string) => setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast("Business name and billing email are required.", "error");
    setBusy(true);
    try {
      const id = client ? (await updateClient(client.id, form), client.id) : await createClient(form);
      toast(client ? "Client updated" : "Client added");
      onSaved?.(id);
      onClose();
    } catch (err) {
      toast((err as Error).message, "error");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Input label="Business name" required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Northwind Labs Inc." />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Contact person" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Jane Doe" />
        <Input label="Billing email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="finance@company.com" />
      </div>
      <Input label="Billing address" value={form.address.street} onChange={(e) => setAddr("street", e.target.value)} placeholder="Street, suite" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="City" value={form.address.city} onChange={(e) => setAddr("city", e.target.value)} />
        <Input label="State / Region" value={form.address.state} onChange={(e) => setAddr("state", e.target.value)} />
        <Input label="Postal code" value={form.address.postalCode} onChange={(e) => setAddr("postalCode", e.target.value)} />
        <Input label="Country" value={form.address.country} onChange={(e) => setAddr("country", e.target.value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Tax ID / VAT" value={form.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="Optional" />
        <CurrencySelect label="Billing currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} />
      </div>
      <Input label="Phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Optional" />
      <Textarea label="Internal notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Only you can see this" />
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-2 flex justify-end gap-2 border-t border-line bg-white px-6 py-4">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-lime" disabled={busy}>{busy && <Spinner />} Save client</button>
      </div>
    </form>
  );
}
