const MAX_SIDE = 1600;
const QUALITY = 0.85;

/**
 * Shrink a photo before upload: longest side at most 1600 px, re-encoded (JPEG, or PNG for
 * PNGs so transparency survives). GIFs (may be animated), small images, and anything the
 * browser cannot decode are returned unchanged, as is a result that came out bigger.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { return file; }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) { bitmap.close(); return file; }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, type, QUALITY));
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[^.]+$/, '') + (type === 'image/png' ? '.png' : '.jpg');
  return new File([blob], name, { type, lastModified: file.lastModified });
}
