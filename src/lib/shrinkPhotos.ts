/**
 * Shrinks design photos before upload, only when they would be too large. Uploads pass through
 * api/proxy.js, and Vercel refuses any request over 4.5 MB, so all photos of one booking together
 * must stay under ~4 MB. If they already fit, every photo is sent untouched. If not, small photos
 * stay as they are and only the big ones are reduced (to JPEG, step by step), just enough to fit.
 */
const TOTAL_BUDGET = 4 * 1024 * 1024;
const MIN_SIDE = 400;

export async function shrinkPhotos(photos: Record<string, File[]>): Promise<Record<string, File[]>> {
  const sizes = Object.values(photos).flat().map((file) => file.size);
  if (sizes.reduce((n, size) => n + size, 0) <= TOTAL_BUDGET) return photos;
  const budget = sizeLimit(sizes, TOTAL_BUDGET);
  const out: Record<string, File[]> = {};
  for (const [part, files] of Object.entries(photos)) {
    // An unreadable file goes as it is; the CRM then answers with its own clear message.
    out[part] = await Promise.all(files.map((file) => shrinkPhoto(file, budget).catch(() => file)));
  }
  return out;
}

/**
 * The largest size any one photo may keep so that all of them fit in `total`: photos under their
 * fair share keep their size, and what they leave unused is shared among the bigger ones.
 */
export function sizeLimit(sizes: number[], total: number): number {
  const sorted = [...sizes].sort((a, b) => a - b);
  let left = total;
  for (let i = 0; i < sorted.length; i++) {
    const share = left / (sorted.length - i);
    if (sorted[i] > share) return share;
    left -= sorted[i];
  }
  return Infinity;
}

async function shrinkPhoto(file: File, budget: number): Promise<File> {
  if (file.size <= budget) return file;
  const bitmap = await createImageBitmap(file);
  try {
    for (let side = Math.max(bitmap.width, bitmap.height); ; side = Math.round(side * 0.75)) {
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
