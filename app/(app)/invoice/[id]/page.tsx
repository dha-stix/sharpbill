import type { Metadata } from "next";
import { Suspense } from "react";
import InvoiceDetailView from "@/components/invoice/InvoiceDetailView";
import { PageLoader } from "@/components/ui/Bits";

export const instant = false;

export const metadata: Metadata = { title: "Invoice" };

export default function Page({ params }: PageProps<"/invoice/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <InvoiceDetailView params={params} />
    </Suspense>
  );
}
