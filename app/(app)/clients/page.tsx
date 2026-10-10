import type { Metadata } from "next";
import ClientsView from "@/components/clients/ClientsView";

export const instant = false;

export const metadata: Metadata = { title: "Clients" };

export default function Page() {
  return <ClientsView />;
}
