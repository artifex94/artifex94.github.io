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

export interface PngResult {
  ok: boolean;
  /** PNG normalizado (siempre image/png). */
  blob?: Blob;
  /** Dimensiones ORIGINALES (para validar tamaño). */
  width?: number;
  height?: number;
  hasAlpha?: boolean;
  reason?: 'heic' | 'undecodable';
}

/** Lado máximo del PNG normalizado: alcanza de sobra para el diseño y lo mantiene liviano. */
export const NORMALIZED_MAX_SIDE = 2000;

/**
 * Decodifica CUALQUIER archivo de imagen y lo re-encoda a PNG.
 *
 * Es el "conversor a PNG" del upload: el celular a veces entrega la foto como
 * JPEG (perdiendo transparencia) o en formatos raros; acá se normaliza todo a un
 * PNG bajo nuestro control. Preserva el alfa cuando el original lo tiene (se
 * dibuja sobre un canvas transparente), y produce un PNG opaco cuando no. El
 * lado mayor se topea en NORMALIZED_MAX_SIDE para que el archivo no se dispare.
 */
export const normalizeToPng = async (file: Blob): Promise<PngResult> => {
  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const looksHeic = isHeicHeader(header);

  if (typeof createImageBitmap === 'undefined') {
    return { ok: false, reason: looksHeic ? 'heic' : 'undecodable' };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { ok: false, reason: looksHeic ? 'heic' : 'undecodable' };
  }

  const width = bitmap.width;
  const height = bitmap.height;

  try {
    const longest = Math.max(width, height);
    const scale = longest > NORMALIZED_MAX_SIDE ? NORMALIZED_MAX_SIDE / longest : 1;
    const outW = Math.max(1, Math.round(width * scale));
    const outH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      closeBitmap(bitmap);
      return { ok: false, reason: 'undecodable' };
    }

    ctx.drawImage(bitmap, 0, 0, outW, outH);
    closeBitmap(bitmap);

    // Alfa real: algún píxel semitransparente ⇒ el diseño tiene transparencia.
    let hasAlpha = false;
    const data = ctx.getImageData(0, 0, outW, outH).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) {
        hasAlpha = true;
        break;
      }
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) return { ok: false, reason: 'undecodable' };

    // Se reportan las dimensiones ORIGINALES para validar tamaño real.
    return { ok: true, blob, width, height, hasAlpha };
  } catch {
    closeBitmap(bitmap);
    return { ok: false, reason: 'undecodable' };
  }
};
