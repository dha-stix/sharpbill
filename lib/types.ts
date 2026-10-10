export type CurrencyCode = string;

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  currency: CurrencyCode;
  taxId: string;
  /** Small base64 data URL (resized client-side) so it renders in invoices and PDFs without CORS issues. */
  logo: string;
  /** Download URL of the full logo in Firebase Storage (users/{uid}/logo.png). Empty if not uploaded. */
  logoUrl?: string;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  /** e.g. Checking, Savings, Current. */
  accountType: string;
  routingNumber: string;
  bankAddress: string;
  swift: string;
}

export type PaymentType = "link" | "bank";

export interface PaymentSettings {
  default: PaymentType;
  link: string;
  bank: BankDetails;
}

export interface EmailJsSettings {
  serviceId: string;
  templateId: string;
  publicKey: string;
  /** The keys that last passed a real test send with an attachment (which needs a paid EmailJS plan). "Connected" only when it matches the current keys. */
  verifiedKeys?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  business: BusinessProfile;
  payment: PaymentSettings;
  emailjs: EmailJsSettings;
  invoicePrefix: string;
  /** Number of invoices created so far; next invoice number is invoiceCounter + 1. */
  invoiceCounter: number;
  defaultDueDays: number;
  setupComplete: boolean;
  createdAt?: number;
}

export interface Client {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: Address;
  taxId: string;
  currency: CurrencyCode;
  notes: string;
  /** Order-number counter: invoices ever issued to this client. Never decreases, so order numbers are not reused after a delete. */
  invoiceCount: number;
  totalBilled: number;
  createdAt?: number;
}

export type ClientInput = Omit<Client, "id" | "invoiceCount" | "totalBilled" | "createdAt">;

/** Invoice design id (ids kept from the original template names so saved invoices keep their look). */
export type TemplateId =
  | "standard"
  | "proforma"
  | "hourly"
  | "recurring"
  | "milestone"
  | "retainer"
  | "commercial"
  | "credit";

export interface LineItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  rate: number;
  /** Optional per-template columns */
  date?: string;
  sku?: string;
  percent?: number;
}

/** Status stored in Firestore. OVERDUE is derived from dueDate at read time. */
export type StoredStatus = "SAVED" | "SENT" | "PAID";
export type InvoiceStatus = StoredStatus | "OVERDUE";

export interface InvoicePayment {
  type: PaymentType;
  link: string;
  bank: BankDetails;
}

export interface Invoice {
  id: string;
  number: string;
  seq: number;
  clientId: string;
  clientOrderNumber: number;
  client: Omit<Client, "invoiceCount" | "totalBilled" | "createdAt" | "notes">;
  business: BusinessProfile;
  template: TemplateId;
  currency: CurrencyCode;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  taxRate: number;
  shipping: number;
  notes: string;
  payment: InvoicePayment;
  /** Template-specific fields, e.g. validUntil, periodStart, referenceInvoice */
  extra: Record<string, string>;
  subtotal: number;
  tax: number;
  total: number;
  status: StoredStatus;
  sentAt?: number | null;
  paidAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export type InvoiceDraft = Omit<
  Invoice,
  "id" | "number" | "seq" | "clientOrderNumber" | "subtotal" | "tax" | "total" | "status" | "createdAt" | "updatedAt"
>;
