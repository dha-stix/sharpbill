import type { Metadata } from "next";
import LoginView from "@/components/auth/LoginView";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description: "Log in to SharpBill — your invoices, clients and payments, right where you left them.",
  path: "/auth/login",
});

export default function Page() {
  return <LoginView />;
}
