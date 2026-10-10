import type { Metadata } from "next";
import InvoicesView from "@/components/app/InvoicesView";

export const instant = false;

export const metadata: Metadata = { title: "Invoices" };

export default function Page() {
  return <InvoicesView />;
}
