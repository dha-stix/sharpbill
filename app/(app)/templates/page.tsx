import type { Metadata } from "next";
import TemplatesView from "@/components/templates/TemplatesView";

export const instant = false;

export const metadata: Metadata = { title: "Designs" };

export default function Page() {
  return <TemplatesView />;
}
