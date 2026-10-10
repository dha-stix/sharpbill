import { renderHomeImage } from "@/lib/og-home";

// Stable URL for the default share image, used by pages without their own
// opengraph-image (route-group images get hashed paths).
export function GET() {
  return renderHomeImage();
}
