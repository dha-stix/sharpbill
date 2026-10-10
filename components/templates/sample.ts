import { EMPTY_BANK } from "@/lib/constants";
import { computeTotals } from "@/lib/invoice-utils";
import type { BusinessProfile, Invoice, LineItem, TemplateId } from "@/lib/types";

const business: BusinessProfile = {
  name: "Studio Ade",
  email: "hello@studioade.co",
  phone: "+234 800 000 0000",
  website: "studioade.co",
  address: { street: "12 Admiralty Way", city: "Lekki", state: "Lagos", postalCode: "106104", country: "Nigeria" },
  currency: "USD",
  taxId: "2384-0012",
  logo: "",
};

const items: Record<TemplateId, LineItem[]> = {
  standard: [
    { id: "1", description: "Brand identity system", details: "Logo suite, colour, type, guidelines", quantity: 1, rate: 2400 },
    { id: "2", description: "Landing page design", details: "Desktop + mobile, two rounds", quantity: 1, rate: 1800 },
    { id: "3", description: "Extra revisions", quantity: 4, rate: 75 },
  ],
  proforma: [
    { id: "1", description: "Discovery workshop", details: "Half-day, remote", quantity: 1, rate: 900 },
    { id: "2", description: "Mobile app UI", details: "18 screens", quantity: 18, rate: 140 },
    { id: "3", description: "Prototype & handoff", quantity: 1, rate: 650 },
  ],
  hourly: [
    { id: "1", description: "API integration", quantity: 6.5, rate: 85 },
    { id: "2", description: "Bug fixes & QA", quantity: 3, rate: 85 },
    { id: "3", description: "Dashboard charts", quantity: 8, rate: 85 },
    { id: "4", description: "Client call & docs", quantity: 1.5, rate: 85 },
  ],
  recurring: [
    { id: "1", description: "Monthly salary — October 2026", details: "Product designer, full-time", quantity: 1, rate: 3200 },
    { id: "2", description: "Overtime", details: "Launch week", quantity: 6, rate: 40 },
  ],
  milestone: [
    { id: "1", description: "Research & strategy", quantity: 1, rate: 1500 },
    { id: "2", description: "Design system", quantity: 1, rate: 2200 },
    { id: "3", description: "Build — phase one", quantity: 1, rate: 1300 },
  ],
  retainer: [
    { id: "1", description: "Design retainer — November", details: "Reserved capacity", quantity: 20, rate: 90 },
    { id: "2", description: "Priority support", quantity: 1, rate: 200 },
  ],
  commercial: [
    { id: "1", description: "Campaign creative", details: "6 key visuals", quantity: 6, rate: 180 },
    { id: "2", description: "Social cut-downs", quantity: 24, rate: 25 },
    { id: "3", description: "Production management", quantity: 10, rate: 60 },
  ],
  credit: [
    { id: "1", description: "Editorial illustration", details: "Feature spread", quantity: 2, rate: 450 },
    { id: "2", description: "Usage licence — 12 months", quantity: 1, rate: 300 },
  ],
};

const extras: Record<TemplateId, Record<string, string>> = {
  standard: { reference: "PO-2291" },
  proforma: { subject: "Mobile app — phase one" },
  hourly: { subject: "Sprint 14", reference: "NW-SPR-14" },
  recurring: { subject: "October 2026" },
  milestone: { subject: "Website redesign" },
  retainer: { subject: "November 2026" },
  commercial: { subject: "Autumn campaign", reference: "BH-7781" },
  credit: { subject: "Illustration — issue 42" },
};

/** Builds a fully populated example invoice for template previews. */
export function sampleInvoice(template: TemplateId): Invoice {
  const list = items[template];
  const shipping = 0;
  const taxRate = template === "commercial" ? 7.5 : 0;
  const totals = computeTotals(list, taxRate, shipping);
  return {
    id: `sample-${template}`,
    number: "INV-024",
    seq: 24,
    clientId: "sample",
    clientOrderNumber: 9,
    client: {
      id: "sample",
      name: template === "commercial" ? "Bluehaus GmbH" : "Northwind Labs Inc.",
      contactName: "Maya Chen",
      email: "finance@northwind.io",
      phone: "",
      address: { street: "500 Market St, Suite 200", city: "San Francisco", state: "CA", postalCode: "94105", country: "United States" },
      taxId: "94-1234567",
      currency: "USD",
    },
    business,
    template,
    currency: "USD",
    issueDate: "2026-10-07",
    dueDate: "2026-10-24",
    items: list,
    taxRate,
    shipping,
    notes: "",
    payment: { type: "link", link: "pay.studioade.co/inv-024", bank: EMPTY_BANK },
    extra: extras[template],
    ...totals,
    status: "SENT",
  };
}
