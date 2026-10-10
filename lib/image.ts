const MAX_FILE_BYTES = 4 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file."));
    if (file.size > MAX_FILE_BYTES) return reject(new Error("Logo must be under 4 MB."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load the image."));
      img.onload = () => resolve(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function drawScaled(img: HTMLImageElement, max: number) {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export interface PreparedLogo {
  /** Small PNG data URL (≤256px) kept on the profile so invoices and PDFs render without network/CORS. */
  dataUrl: string;
  /** Larger PNG (≤512px) uploaded to Firebase Storage. */
  blob: Blob;
}

/** Validates and resizes an uploaded logo into the two versions the app stores. */
export async function prepareLogo(file: File): Promise<PreparedLogo> {
  const img = await loadImage(file);
  const dataUrl = drawScaled(img, 256).toDataURL("image/png");
  const blob = await new Promise<Blob>((resolve, reject) =>
    drawScaled(img, 512).toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process the image."))), "image/png")
  );
  return { dataUrl, blob };
}
