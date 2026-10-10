import type { Metadata } from "next";

/**
 * Public site URL, used to build absolute links for share images, the sitemap
 * and robots.txt. Set NEXT_PUBLIC_SITE_URL (e.g. https://sharpbill.app) when you
 * deploy; on Vercel the production domain is picked up automatically.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "SharpBill";
export const SITE_TITLE = "SharpBill — Invoices that get you paid";
export const SITE_DESCRIPTION =
  "Beautiful invoices for freelancers — any currency, emailed to clients from the app or downloaded as print-ready PDFs.";

/** Homepage share image served at /og.png (see app/og.png/route.ts), used as the site-wide default. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "SharpBill — Invoices that get you paid. Beautiful invoices for freelancers in any currency.",
};

/** Title, description and share-card text for a public page. Share images come from opengraph-image.tsx files. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const full = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: path, title: full, description },
    twitter: { card: "summary_large_image", title: full, description },
  };
}

/** Signed-in or setup pages that should never appear in search results. */
export const PRIVATE_METADATA: Metadata = { robots: { index: false, follow: false } };
