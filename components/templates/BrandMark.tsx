"use client";

import { useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { cn, initials } from "@/lib/format";
import type { BusinessProfile } from "@/lib/types";

/** Only embedded images are guaranteed to render inside a generated PDF (remote URLs can be blocked by CORS). */
const isEmbedded = (src: string) => /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i.test(src);

/**
 * The issuer's logo on an invoice. Falls back to the business initials whenever
 * the logo is missing, isn't an embedded image, or fails to load — so the
 * invoice and its PDF always show a mark instead of a broken or blank image.
 */
export function BrandMark({ business, className, fallbackClass }: { business: BusinessProfile; className?: string; fallbackClass?: string }) {
  // Remember which logo failed, so a newly uploaded logo gets a fresh attempt.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = business.logo;

  if (src && isEmbedded(src) && failedSrc !== src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={business.name}
        data-brand-logo
        className={cn("object-contain", className)}
        // An image that already failed before React attached `onError` (server-rendered markup) never fires it again.
        ref={(img) => {
          if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
        }}
        onError={() => setFailedSrc(src)}
        // A file that "loads" but has no pixels (corrupt image) is also a failure.
        onLoad={(e) => e.currentTarget.naturalWidth === 0 && setFailedSrc(src)}
      />
    );

  return (
    <span data-brand-initials className={cn("grid place-items-center font-display font-extrabold", className, fallbackClass)}>
      {initials(business.name || APP_NAME)}
    </span>
  );
}
