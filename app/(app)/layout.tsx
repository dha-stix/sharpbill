import type { Metadata } from "next";
import AppShell from "@/components/app/AppShell";
import { PRIVATE_METADATA } from "@/lib/site";

// Signed-in pages stay out of search results.
export const metadata: Metadata = PRIVATE_METADATA;

// The signed-in area is gated and loaded on the client (Firebase session),
// so its pages can't be part of the prerendered shell — opt out of instant validation.
export const instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
