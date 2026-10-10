import type { Metadata } from "next";
import { Suspense } from "react";
import InvoiceEditView from "@/components/invoice/InvoiceEditView";
import { PageLoader } from "@/components/ui/Bits";

export const instant = false;

export const metadata: Metadata = { title: "Edit invoice" };

export default function Page({ params }: PageProps<"/invoice/[id]/edit">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <InvoiceEditView params={params} />
    </Suspense>
  );
}
