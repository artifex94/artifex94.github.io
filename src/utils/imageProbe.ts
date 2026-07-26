export interface ImageProbe {
  ok: boolean;
  width?: number;
  height?: number;
  hasAlpha: boolean;
  reason?: 'heic' | 'undecodable';
}

const HEIC_BRANDS = new Set(['heic', 'heix', 'heif', 'mif1', 'hevc', 'hevx']);

const asciiAt = (bytes: Uint8Array, offset: number, length: number): string => {
  let out = '';
  for (let i = 0; i < length && offset + i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[offset + i]);
  }
  return out;
};

/** Detecta archivos HEIC/HEIF por la caja ISO-BMFF `ftyp` al comienzo. */
export const isHeicHeader = (bytes: Uint8Array): boolean => {
  if (bytes.length < 12) return false;
  if (asciiAt(bytes, 4, 4) !== 'ftyp') return false;

  for (let offset = 8; offset + 4 <= Math.min(bytes.length, 32); offset += 4) {
    if (HEIC_BRANDS.has(asciiAt(bytes, offset, 4))) return true;
  }

  return false;
};

const closeBitmap = (bitmap: ImageBitmap): void => {
  if (typeof bitmap.close === 'function') bitmap.close();
};

export const probeImage = async (file: Blob): Promise<ImageProbe> => {
  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const looksHeic = isHeicHeader(header);

  if (typeof createImageBitmap === 'undefined') {
    return { ok: false, hasAlpha: false, reason: looksHeic ? 'heic' : 'undecodable' };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, hasAlpha: false, reason: looksHeic ? 'heic' : 'undecodable' };
  }

  const { width, height } = bitmap;

  try {
    const longest = Math.max(width, height);
    const scale = longest > 256 ? 256 / longest : 1;
    const sampleWidth = Math.max(1, Math.round(width * scale));
    const sampleHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      closeBitmap(bitmap);
      return { ok: true, width, height, hasAlpha: false };
    }

    context.drawImage(bitmap, 0, 0, sampleWidth, sampleHeight);
    const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;

    for (let index = 3; index < data.length; index += 4) {
      if (data[index] < 250) {
        closeBitmap(bitmap);
        return { ok: true, width, height, hasAlpha: true };
      }
    }

    closeBitmap(bitmap);
    return { ok: true, width, height, hasAlpha: false };
  } catch {
    closeBitmap(bitmap);
    return { ok: true, width, height, hasAlpha: false };
  }
};
