import type { Metadata } from "next";
import RegisterView from "@/components/auth/RegisterView";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Create your account",
  description: "Start billing like a pro in minutes: 8 invoice designs, any currency, invoices emailed with the PDF attached.",
  path: "/auth/register",
});

export default function Page() {
  return <RegisterView />;
}
