// Browser-side preparation of crop-health photos before upload.
// Hosting platforms cap request bodies (Vercel Functions: 4.5 MB) and many farmers upload over
// mobile data, so large photos are resized to a diagnostic-quality JPEG in the browser first.

/** Largest photo the API accepts. Keep in sync with app/api/crop-cases/route.ts. */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RESIZE_ABOVE_BYTES = 1.5 * 1024 * 1024;
const ATTEMPTS = [
  { maxSide: 2048, quality: 0.85 },
  { maxSide: 1600, quality: 0.8 },
  { maxSide: 1280, quality: 0.75 },
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Unable to read the photo.")); };
    image.src = url;
  });
}

function toJpeg(image: HTMLImageElement, maxSide: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve(null);
  context.fillStyle = "#ffffff"; // flatten any PNG/WebP transparency onto white
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** Returns an upload-ready photo, or throws an Error with a message suitable for the user. */
export async function prepareCropPhoto(file: File): Promise<File> {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) throw new Error("Upload a JPG, PNG or WebP crop photo.");
  if (file.size <= RESIZE_ABOVE_BYTES) return file;
  try {
    const image = await loadImage(file);
    for (const { maxSide, quality } of ATTEMPTS) {
      const blob = await toJpeg(image, maxSide, quality);
      if (blob && blob.size <= MAX_PHOTO_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg", lastModified: Date.now() });
      }
    }
  } catch {
    // Fall back to the original file if the browser cannot process it.
  }
  if (file.size <= MAX_PHOTO_BYTES) return file;
  throw new Error("This photo is too large to upload. Please choose a smaller photo (4 MB maximum).");
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
