/**
 * Shrinks design photos before upload. Uploads pass through api/proxy.js, and Vercel refuses any
 * request over 4.5 MB, so all photos of one booking together must stay under ~4 MB.
 * Photos already small enough are sent untouched; larger ones become a JPEG, reduced step by step.
 */
const TOTAL_BUDGET = 4 * 1024 * 1024;
const FIRST_SIDE = 1600;
const MIN_SIDE = 400;

export async function shrinkPhotos(photos: Record<string, File[]>): Promise<Record<string, File[]>> {
  const count = Object.values(photos).reduce((n, files) => n + files.length, 0);
  const budget = TOTAL_BUDGET / Math.max(count, 1);
  const out: Record<string, File[]> = {};
  for (const [part, files] of Object.entries(photos)) {
    // An unreadable file goes as it is; the CRM then answers with its own clear message.
    out[part] = await Promise.all(files.map((file) => shrinkPhoto(file, budget).catch(() => file)));
  }
  return out;
}

async function shrinkPhoto(file: File, budget: number): Promise<File> {
  if (file.size <= budget) return file;
  const bitmap = await createImageBitmap(file);
  try {
    for (let side = FIRST_SIDE; ; side = Math.round(side * 0.75)) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;
      ctx.fillStyle = '#fff'; // transparent PNG areas would turn black in a JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
      if (!blob) return file;
      if (blob.size <= budget || side <= MIN_SIDE) {
        return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
      }
    }
  } finally {
    bitmap.close();
  }
}
