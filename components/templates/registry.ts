import type { TemplateId } from "@/lib/types";

/**
 * Invoice designs. Every design renders the same Standard invoice data
 * (line items × qty × rate, tax, notes, payment) — they differ only in look.
 * The ids are kept from the original template types so saved invoices keep
 * their design.
 */

export type DesignGroup = "Minimal" | "Corporate" | "Creative" | "Technical";

export interface ExtraField {
  key: "reference" | "subject";
  label: string;
  placeholder: string;
}

/** Optional fields shared by every design. */
export const SHARED_FIELDS: ExtraField[] = [
  { key: "subject", label: "Subject (optional)", placeholder: "e.g. October retainer, Brand refresh" },
  { key: "reference", label: "PO / reference (optional)", placeholder: "e.g. PO-2291" },
];

/** Labels printed on every design. */
const DOC = {
  title: "Invoice",
  totalLabel: "Total due",
  columns: { desc: "Description", qty: "Qty", rate: "Rate", amount: "Amount" },
};

export interface TemplateMeta {
  id: TemplateId;
  /** Design name shown in the app */
  name: string;
  /** Short description of the look */
  look: string;
  group: DesignGroup;
  bestFor: string;
  swatch: { bg: string; ink: string; accent: string };
  title: string;
  totalLabel: string;
  columns: { desc: string; qty: string; rate: string; amount: string };
}

const design = (m: Omit<TemplateMeta, keyof typeof DOC>): TemplateMeta => ({ ...DOC, ...m });

export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  standard: design({ id: "standard", name: "Monolith", look: "Bold ink & lime, oversized title", group: "Minimal", bestFor: "Everyone — the default", swatch: { bg: "#F5F5F0", ink: "#0E1116", accent: "#C8F031" } }),
  proforma: design({ id: "proforma", name: "Blueprint", look: "Navy grid header, sky accents", group: "Corporate", bestFor: "Tech & engineering clients", swatch: { bg: "#14234B", ink: "#FFFFFF", accent: "#7DD3FC" } }),
  hourly: design({ id: "hourly", name: "Ledger", look: "Blue spine, numbers first", group: "Technical", bestFor: "Developers & consultants", swatch: { bg: "#EAF0FF", ink: "#1D3A8A", accent: "#1D3A8A" } }),
  recurring: design({ id: "recurring", name: "Cycle", look: "Lime band, issue-to-due timeline", group: "Creative", bestFor: "Monthly salary & retainers", swatch: { bg: "#EEF7CF", ink: "#3D4F00", accent: "#C8F031" } }),
  milestone: design({ id: "milestone", name: "Atelier", look: "Warm cream paper, serif type", group: "Creative", bestFor: "Designers, writers, creatives", swatch: { bg: "#FBF4EA", ink: "#9A3412", accent: "#EA580C" } }),
  retainer: design({ id: "retainer", name: "Emerald", look: "Deep green side column", group: "Corporate", bestFor: "Premium consulting", swatch: { bg: "#0F3D2E", ink: "#FFFFFF", accent: "#86EFAC" } }),
  commercial: design({ id: "commercial", name: "Manifest", look: "Purple, structured cards & barcode", group: "Corporate", bestFor: "Agencies & studios", swatch: { bg: "#F3EEFF", ink: "#4B2A9A", accent: "#4B2A9A" } }),
  credit: design({ id: "credit", name: "Counterfoil", look: "Ticket stub with a status stamp", group: "Minimal", bestFor: "Bold, personal brands", swatch: { bg: "#FFEDE8", ink: "#B93A26", accent: "#B93A26" } }),
};

export const TEMPLATE_LIST = Object.values(TEMPLATES);
export const DESIGN_GROUPS: DesignGroup[] = ["Minimal", "Corporate", "Creative", "Technical"];
