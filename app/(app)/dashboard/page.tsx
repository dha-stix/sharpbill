import type { Metadata } from "next";
import DashboardView from "@/components/app/DashboardView";

export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardView />;
}
