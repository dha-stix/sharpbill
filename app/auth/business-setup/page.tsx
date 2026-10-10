import type { Metadata } from "next";
import BusinessSetupView from "@/components/auth/BusinessSetupView";
import { PRIVATE_METADATA } from "@/lib/site";

export const metadata: Metadata = { title: "Business setup", ...PRIVATE_METADATA };

export default function Page() {
  return <BusinessSetupView />;
}
