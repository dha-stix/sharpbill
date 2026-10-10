import type { Metadata } from "next";
import { Suspense } from "react";
import InvoiceEditor from "@/components/invoice/InvoiceEditor";
import { PageLoader } from "@/components/ui/Bits";

export const instant = false;

export const metadata: Metadata = { title: "New invoice" };

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InvoiceEditor />
    </Suspense>
  );
}
