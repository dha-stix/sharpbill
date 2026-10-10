import type { Metadata } from "next";
import { Suspense } from "react";
import ClientDetailView from "@/components/clients/ClientDetailView";
import { PageLoader } from "@/components/ui/Bits";

export const instant = false;

export const metadata: Metadata = { title: "Client" };

export default function Page({ params }: PageProps<"/clients/[id]">) {
  return (
    <Suspense fallback={<PageLoader />}>
      <ClientDetailView params={params} />
    </Suspense>
  );
}
