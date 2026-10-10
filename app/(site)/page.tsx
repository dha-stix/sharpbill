import CallToAction from "@/components/home/CallToAction";
import Demo from "@/components/home/Demo";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import Navbar from "@/components/home/Navbar";
import TemplatesFan from "@/components/home/TemplatesFan";
import Ticker from "@/components/home/Ticker";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: "/", title: SITE_TITLE, description: SITE_DESCRIPTION },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

export default function HomePage() {
  return (
    <div className="overflow-x-clip">
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Demo />
        <Features />
        <HowItWorks />
        <TemplatesFan />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
