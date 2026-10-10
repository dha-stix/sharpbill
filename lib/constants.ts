import type { Address, BankDetails, BusinessProfile, InvoiceStatus } from "./types";

export const APP_NAME = "SharpBill";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
] as const;

export const STATUS_STYLES: Record<InvoiceStatus, { bg: string; fg: string; dot: string }> = {
  SAVED: { bg: "bg-[#EDEDE6]", fg: "text-[#3A4150]", dot: "bg-[#8A8F9C]" },
  SENT: { bg: "bg-[#E4ECFF]", fg: "text-[#1D3FA8]", dot: "bg-[#1D3FA8]" },
  PAID: { bg: "bg-[#E2F3E8]", fg: "text-[#1F6B42]", dot: "bg-[#1F6B42]" },
  OVERDUE: { bg: "bg-[#FBE6E4]", fg: "text-[#A3241B]", dot: "bg-[#A3241B]" },
};

export const EMPTY_ADDRESS: Address = { street: "", city: "", state: "", postalCode: "", country: "" };
export const EMPTY_BANK: BankDetails = { accountName: "", bankName: "", accountNumber: "", accountType: "", routingNumber: "", bankAddress: "", swift: "" };

/** Bank transfer fields, in the order they appear on forms, invoices and emails. */
export const BANK_FIELDS: { key: keyof BankDetails; label: string; mono?: boolean; wide?: boolean; placeholder?: string }[] = [
  { key: "accountName", label: "Account name" },
  { key: "bankName", label: "Bank name" },
  { key: "accountNumber", label: "Account number", mono: true },
  { key: "accountType", label: "Account type", placeholder: "Checking, Savings…" },
  { key: "routingNumber", label: "Routing number", mono: true },
  { key: "swift", label: "SWIFT / IBAN", mono: true, placeholder: "Optional" },
  { key: "bankAddress", label: "Bank address", wide: true },
];
export const ACCOUNT_TYPES = ["Checking", "Savings", "Current", "Business"];
export const EMPTY_BUSINESS: BusinessProfile = {
  name: "",
  email: "",
  phone: "",
  website: "",
  address: EMPTY_ADDRESS,
  currency: "USD",
  taxId: "",
  logo: "",
  logoUrl: "",
};

/** Variables filled in when an invoice email is sent (see lib/email.ts). */
export const EMAIL_VARIABLES = {
  /** {{name}} — plain text */
  text: ["client_name", "business_name", "business_initials", "business_logo_url", "invoice_number", "amount", "issue_date", "due_date", "payment_cta_label", "payment_cta_url", "attachment_note"],
  /** {{{name}}} — pre-escaped HTML, needs triple braces */
  html: ["message_html", "payment_details_html"],
} as const;
export const EMPTY_EMAILJS = { serviceId: "", templateId: "", publicKey: "" };

