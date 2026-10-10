"use client";

import { Input } from "@/components/ui/Bits";
import { ACCOUNT_TYPES, BANK_FIELDS, EMPTY_BANK } from "@/lib/constants";
import { cn } from "@/lib/format";
import type { BankDetails } from "@/lib/types";

/** Bank transfer inputs, shared by Settings (default details) and the invoice editor (per-invoice override). */
export default function BankFields({ value, onChange }: { value: BankDetails; onChange: (bank: BankDetails) => void }) {
  const bank = { ...EMPTY_BANK, ...value };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BANK_FIELDS.map((f) => (
        <Input
          key={f.key}
          label={f.label}
          className={cn(f.mono && "font-mono", f.wide && "sm:col-span-2")}
          placeholder={f.placeholder}
          list={f.key === "accountType" ? "bank-account-types" : undefined}
          value={bank[f.key]}
          onChange={(e) => onChange({ ...bank, [f.key]: e.target.value })}
        />
      ))}
      <datalist id="bank-account-types">
        {ACCOUNT_TYPES.map((t) => <option key={t} value={t} />)}
      </datalist>
    </div>
  );
}
