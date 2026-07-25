import { describe, it, expect } from 'vitest';
import { sniffImageHeader, canBeContoured } from './imageFormat';

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const writeUint32BE = (bytes: number[], value: number): void => {
  bytes.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
};

const pushChunk = (bytes: number[], type: string, data: readonly number[]): void => {
  writeUint32BE(bytes, data.length);
  for (const char of type) bytes.push(char.charCodeAt(0));
  bytes.push(...data);
  writeUint32BE(bytes, 0); // CRC: no se valida al identificar el formato.
};

/** Construye un PNG mínimo con el color type pedido y los chunks extra que se indiquen. */
const makePng = (
  colorType: number,
  { width = 800, height = 600, extraChunks = [] as readonly string[] } = {},
): Uint8Array => {
  const bytes = [...PNG_SIGNATURE];

  const ihdr: number[] = [];
  writeUint32BE(ihdr, width);
  writeUint32BE(ihdr, height);
  ihdr.push(8, colorType, 0, 0, 0); // bit depth, color type, compresión, filtro, interlace
  pushChunk(bytes, 'IHDR', ihdr);

  for (const type of extraChunks) pushChunk(bytes, type, [0x00, 0x01, 0x02]);
  pushChunk(bytes, 'IDAT', [0x00]);
  pushChunk(bytes, 'IEND', []);

  return new Uint8Array(bytes);
};

describe('sniffImageHeader', () => {
  it('lee las dimensiones del IHDR', () => {
    const info = sniffImageHeader(makePng(6, { width: 1234, height: 567 }));
    expect(info.format).toBe('png');
    expect(info.width).toBe(1234);
    expect(info.height).toBe(567);
  });

  it('reconoce los color type de PNG que llevan canal alfa', () => {
    // 4 = gris + alfa, 6 = color + alfa.
    expect(sniffImageHeader(makePng(4)).hasAlphaChannel).toBe(true);
    expect(sniffImageHeader(makePng(6)).hasAlphaChannel).toBe(true);
  });

  it('reconoce los color type de PNG que NO llevan alfa', () => {
    // 0 = gris, 2 = color verdadero.
    expect(sniffImageHeader(makePng(0)).hasAlphaChannel).toBe(false);
    expect(sniffImageHeader(makePng(2)).hasAlphaChannel).toBe(false);
  });

  it('detecta transparencia en PNG indexados solo si traen chunk tRNS', () => {
    // En las indexadas el alfa no es un canal: vive en un chunk aparte.
    expect(sniffImageHeader(makePng(3)).hasAlphaChannel).toBe(false);
    expect(sniffImageHeader(makePng(3, { extraChunks: ['tRNS'] })).hasAlphaChannel).toBe(true);
  });

  it('ignora un tRNS que aparezca después de IDAT', () => {
    // El orden importa: después de los datos de imagen ya no es válido.
    const bytes = [...PNG_SIGNATURE];
    const ihdr: number[] = [];
    writeUint32BE(ihdr, 100);
    writeUint32BE(ihdr, 100);
    ihdr.push(8, 3, 0, 0, 0);
    pushChunk(bytes, 'IHDR', ihdr);
    pushChunk(bytes, 'IDAT', [0x00]);
    pushChunk(bytes, 'tRNS', [0x00]);

    expect(sniffImageHeader(new Uint8Array(bytes)).hasAlphaChannel).toBe(false);
  });

  it('no entra en bucle con un chunk de longitud corrupta', () => {
    const bytes = [...PNG_SIGNATURE];
    const ihdr: number[] = [];
    writeUint32BE(ihdr, 10);
    writeUint32BE(ihdr, 10);
    ihdr.push(8, 3, 0, 0, 0);
    pushChunk(bytes, 'IHDR', ihdr);
    // Longitud gigante que se pasa del final del buffer.
    writeUint32BE(bytes, 0xfffffff0);
    for (const char of 'junk') bytes.push(char.charCodeAt(0));

    expect(sniffImageHeader(new Uint8Array(bytes)).hasAlphaChannel).toBe(false);
  });

  it('identifica JPEG, WebP y GIF, todos sin alfa utilizable', () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(sniffImageHeader(jpeg)).toEqual({ format: 'jpeg', hasAlphaChannel: false });

    const webp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(sniffImageHeader(webp)).toEqual({ format: 'webp', hasAlphaChannel: false });

    const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    expect(sniffImageHeader(gif)).toEqual({ format: 'gif', hasAlphaChannel: false });
  });

  it('no confía en la extensión: un JPEG renombrado a .png se detecta igual', () => {
    // Es exactamente el caso que rompería el pipeline si se mirara file.type.
    const jpegDisfrazado = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43]);
    expect(sniffImageHeader(jpegDisfrazado).format).toBe('jpeg');
    expect(canBeContoured(sniffImageHeader(jpegDisfrazado))).toBe(false);
  });

  it('devuelve "desconocido" con basura o con un buffer vacío', () => {
    expect(sniffImageHeader(new Uint8Array([1, 2, 3])).format).toBe('desconocido');
    expect(sniffImageHeader(new Uint8Array([])).format).toBe('desconocido');
  });
});

describe('canBeContoured', () => {
  it('solo habilita el contorneado con PNG que declare alfa', () => {
    expect(canBeContoured(sniffImageHeader(makePng(6)))).toBe(true);
    expect(canBeContoured(sniffImageHeader(makePng(2)))).toBe(false);
    expect(canBeContoured({ format: 'webp', hasAlphaChannel: true })).toBe(false);
  });
});
