"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CurrencySelect, Input, Spinner } from "@/components/ui/Bits";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { deleteBusinessLogo, uploadBusinessLogo } from "@/lib/firebase-actions";
import { prepareLogo } from "@/lib/image";
import type { Address, BusinessProfile } from "@/lib/types";

/** Controlled business-profile fields, shared by onboarding and Settings. */
export default function BusinessFields({ value, onChange }: { value: BusinessProfile; onChange: (b: BusinessProfile) => void }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof BusinessProfile>(k: K, v: BusinessProfile[K]) => onChange({ ...value, [k]: v });
  const setAddr = (k: keyof Address, v: string) => onChange({ ...value, address: { ...value.address, [k]: v } });

  const [uploading, setUploading] = useState(false);

  // The upload finishes later, so merge into the latest form values, not the ones captured at click time.
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);
  const patch = (p: Partial<BusinessProfile>) => {
    latest.current = { ...latest.current, ...p };
    onChange(latest.current);
  };

  /**
   * Shows the logo straight away from a small embedded copy (what invoices and PDFs use),
   * then uploads the full image to Firebase Storage and records its URL.
   */
  async function onLogo(file?: File) {
    if (!file) return;
    try {
      const { dataUrl, blob } = await prepareLogo(file);
      patch({ logo: dataUrl });
      setUploading(true);
      try {
        patch({ logoUrl: await uploadBusinessLogo(blob) });
      } catch (e) {
        patch({ logoUrl: "" });
        toast(`Logo added to your invoices, but the Storage upload failed: ${(e as Error).message}`, "info");
      }
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeLogo() {
    patch({ logo: "", logoUrl: "" });
    try {
      await deleteBusinessLogo();
    } catch {
      /* the profile no longer points at the file; nothing else to do */
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-5">
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, rotate: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onLogo(e.dataTransfer.files?.[0]);
          }}
          className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-[20px] border-2 border-dashed border-[#C9C9BF] bg-paper transition-colors hover:border-ink"
          aria-label="Upload logo"
        >
          {value.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.logo} alt="Business logo" className="size-full object-contain p-2" />
          ) : (
            <Icon name="upload" size={28} />
          )}
        </motion.button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
        <div>
          <div className="font-semibold">Business logo</div>
          <div className="mt-1 text-sm text-muted">PNG, JPG or SVG · square works best · click or drop</div>
          {uploading ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted"><Spinner /> Uploading…</div>
          ) : (
            value.logo && <button type="button" onClick={removeLogo} className="mt-2 text-sm text-danger hover:underline">Remove logo</button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Business name" required value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="Studio Ade" />
        <Input label="Business email" type="email" required value={value.email} onChange={(e) => set("email", e.target.value)} placeholder="hello@studio.com" />
        <Input label="Phone" type="tel" value={value.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 800 000 0000" />
        <Input label="Website" value={value.website} onChange={(e) => set("website", e.target.value)} placeholder="studio.com" />
      </div>
      <Input label="Street address" value={value.address.street} onChange={(e) => setAddr("street", e.target.value)} placeholder="12 Admiralty Way" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="City" value={value.address.city} onChange={(e) => setAddr("city", e.target.value)} />
        <Input label="State / Region" value={value.address.state} onChange={(e) => setAddr("state", e.target.value)} />
        <Input label="Postal code" value={value.address.postalCode} onChange={(e) => setAddr("postalCode", e.target.value)} />
        <Input label="Country" value={value.address.country} onChange={(e) => setAddr("country", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CurrencySelect label="Default currency" value={value.currency} onChange={(e) => set("currency", e.target.value)} />
        <Input label="Tax ID / VAT number" value={value.taxId} onChange={(e) => set("taxId", e.target.value)} placeholder="Optional" />
      </div>
    </div>
  );
}
