import { HOME_IMAGE_ALT, renderHomeImage } from "@/lib/og-home";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

// Homepage share image (the same image is served at /og.png as the site-wide default).
export const alt = HOME_IMAGE_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderHomeImage();
}
