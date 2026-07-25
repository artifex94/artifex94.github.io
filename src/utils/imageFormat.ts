// Identificación de formato de imagen leyendo la cabecera del archivo.
//
// POR QUÉ NO ALCANZA CON file.type NI CON LA EXTENSIÓN:
// Renombrar un .jpg a .png es trivial, y el navegador reporta el MIME a partir
// de la extensión. Si se confía en eso, un JPG disfrazado habilita la opción de
// pieza contorneada y después el pipeline no encuentra ninguna transparencia.
//
// Estas funciones son puras y trabajan sobre bytes: no dependen del DOM ni de
// canvas, así que se pueden testear sin navegador.

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'desconocido';

export interface ImageHeaderInfo {
  format: ImageFormat;
  /** Ancho en píxeles, si se pudo leer de la cabecera. */
  width?: number;
  /** Alto en píxeles, si se pudo leer de la cabecera. */
  height?: number;
  /**
   * true si el archivo tiene un canal alfa DECLARADO.
   *
   * OJO: que exista el canal no significa que se use. Una imagen puede ser RGBA
   * con todos los píxeles opacos. La verificación de que la transparencia
   * realmente esté usada se hace después, sobre los píxeles decodificados.
   */
  hasAlphaChannel: boolean;
}

/** Cuántos bytes del archivo hay que leer para poder identificarlo. */
export const HEADER_BYTES_NEEDED = 64 * 1024;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean => {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
};

/** Lee un entero de 32 bits big-endian, que es como PNG guarda sus números. */
const readUint32BE = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) >>> 0) +
  (bytes[offset + 1] << 16) +
  (bytes[offset + 2] << 8) +
  bytes[offset + 3];

const asciiAt = (bytes: Uint8Array, offset: number, length: number): string => {
  let out = '';
  for (let i = 0; i < length; i += 1) out += String.fromCharCode(bytes[offset + i]);
  return out;
};

/**
 * ¿Una imagen PNG indexada (color type 3) declara transparencia?
 *
 * En las indexadas el alfa no es un canal: vive en un chunk tRNS opcional que
 * asigna opacidad a entradas de la paleta. Hay que recorrer los chunks hasta
 * encontrarlo o hasta llegar a los datos de imagen (IDAT), después del cual ya
 * no aparece.
 */
const indexedPngHasTransparency = (bytes: Uint8Array): boolean => {
  // Los chunks arrancan después de la firma de 8 bytes.
  let offset = 8;

  while (offset + 8 <= bytes.length) {
    const length = readUint32BE(bytes, offset);
    const type = asciiAt(bytes, offset + 4, 4);

    if (type === 'tRNS') return true;
    // A partir de IDAT vienen los datos comprimidos: tRNS ya no puede aparecer.
    if (type === 'IDAT' || type === 'IEND') return false;

    // 4 de longitud + 4 de tipo + datos + 4 de CRC.
    const next = offset + 12 + length;
    // Longitud corrupta o desbordada: cortar en vez de entrar en un bucle infinito.
    if (next <= offset || !Number.isFinite(next)) return false;
    offset = next;
  }

  return false;
};

/** Identifica el formato de una imagen a partir de los primeros bytes del archivo. */
export const sniffImageHeader = (bytes: Uint8Array): ImageHeaderInfo => {
  if (startsWith(bytes, PNG_SIGNATURE)) {
    // El primer chunk de un PNG válido es siempre IHDR, y trae las dimensiones
    // y el color type en posiciones fijas.
    const width = bytes.length >= 24 ? readUint32BE(bytes, 16) : undefined;
    const height = bytes.length >= 24 ? readUint32BE(bytes, 20) : undefined;
    const colorType = bytes.length >= 26 ? bytes[25] : -1;

    // 4 = gris + alfa, 6 = color + alfa, 3 = indexado (alfa opcional vía tRNS).
    const hasAlphaChannel =
      colorType === 4 || colorType === 6 || (colorType === 3 && indexedPngHasTransparency(bytes));

    return { format: 'png', width, height, hasAlphaChannel };
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    // JPEG no soporta transparencia en ninguna variante.
    return { format: 'jpeg', hasAlphaChannel: false };
  }

  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    // WebP puede tener alfa, pero la pieza contorneada exige PNG por decisión
    // de producto, así que no hace falta desarmar los sub-chunks VP8X/VP8L.
    return { format: 'webp', hasAlphaChannel: false };
  }

  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) {
    return { format: 'gif', hasAlphaChannel: false };
  }

  return { format: 'desconocido', hasAlphaChannel: false };
};

/**
 * ¿Este archivo puede usarse para una pieza contorneada?
 *
 * Solo PNG con canal alfa declarado. El resto de los formatos se limita a las
 * formas circular y rectangular, porque sin transparencia no hay silueta que
 * recortar y no se hace remoción de fondo automática.
 */
export const canBeContoured = (info: ImageHeaderInfo): boolean =>
  info.format === 'png' && info.hasAlphaChannel;
