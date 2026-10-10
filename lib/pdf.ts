import { APP_NAME } from "./constants";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * "print" — crisp file for downloading/printing.
 * "email" — lighter file for EmailJS attachments (plan limits are per request:
 *           Personal 500 KB, Professional 2 MB), still sharp on screen.
 */
const PRESETS = {
  print: { pixelRatio: 2, quality: 0.92 },
  email: { pixelRatio: 1.6, quality: 0.8 },
} as const;

export type PdfPreset = keyof typeof PRESETS;

export interface InvoicePdf {
  blob: Blob;
  /** Standard `data:application/pdf;base64,…` URL (EmailJS variable attachment format). */
  dataUrl: string;
  /** Size of the encoded attachment as sent to EmailJS, in bytes. */
  encodedBytes: number;
  save: () => void;
}

/** Waits for the next paint. Browsers pause animation frames in background tabs, so a timer backs it up. */
const nextPaint = () =>
  new Promise<void>((r) => {
    requestAnimationFrame(() => requestAnimationFrame(() => r()));
    setTimeout(r, 120);
  });

/** Resolves once every image in `node` has either loaded or failed, plus a paint for React to react to failures. */
async function imagesSettled(node: HTMLElement) {
  const pending = [...node.querySelectorAll("img")].filter((img) => !img.complete);
  await Promise.all(pending.map((img) => new Promise<void>((r) => {
    img.addEventListener("load", () => r(), { once: true });
    img.addEventListener("error", () => r(), { once: true });
  })));
  await nextPaint();
}

/**
 * Renders an invoice DOM node (rendered at A4 width, 794px) into a PDF.
 * Uses html-to-image (browser-native rendering, so modern CSS works) and jsPDF.
 * Tall invoices are sliced across multiple A4 pages.
 */
export async function renderInvoicePdf(node: HTMLElement, fileName: string, preset: PdfPreset = "print"): Promise<InvoicePdf> {
  const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  const { pixelRatio, quality } = PRESETS[preset];

  // Wait for fonts so the PDF uses the same typefaces as the screen.
  if (document.fonts?.ready) await document.fonts.ready;
  // Let the logo finish loading (or fail and be replaced by the business initials) before capturing.
  await imagesSettled(node);

  const capture = () => {
    const width = node.offsetWidth;
    const height = node.scrollHeight;
    return toJpeg(node, { quality, pixelRatio, backgroundColor: "#ffffff", width, height, cacheBust: true });
  };

  let image: string;
  try {
    image = await capture();
  } catch (err) {
    // The renderer could not embed an image. Swap any logo for the initials and try once more,
    // so an unreadable logo never stops the invoice PDF from being generated.
    const logos = node.querySelectorAll<HTMLImageElement>("img[data-brand-logo]");
    if (!logos.length) throw err;
    logos.forEach((img) => img.dispatchEvent(new Event("error")));
    await nextPaint();
    image = await capture();
  }

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.setProperties({ title: fileName, creator: APP_NAME, author: APP_NAME, subject: "Invoice" });

  // Measured after capturing, in case the logo was swapped for the initials.
  const imgHeightMm = (node.scrollHeight * A4_WIDTH_MM) / node.offsetWidth;
  let offset = 0;
  let page = 0;
  while (offset < imgHeightMm - 0.5) {
    if (page > 0) pdf.addPage();
    pdf.addImage(image, "JPEG", 0, -offset, A4_WIDTH_MM, imgHeightMm, undefined, "FAST");
    offset += A4_HEIGHT_MM;
    page += 1;
  }

  // jsPDF's own "datauristring" adds a non-standard `;filename=` parameter,
  // so build a plain base64 data URL that EmailJS can decode.
  const base64 = btoa(pdf.output());
  return {
    blob: pdf.output("blob"),
    dataUrl: `data:application/pdf;base64,${base64}`,
    encodedBytes: base64.length,
    save: () => pdf.save(`${fileName}.pdf`),
  };
}
