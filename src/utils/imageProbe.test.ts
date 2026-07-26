import { describe, it, expect } from 'vitest';
import { isHeicHeader } from './imageProbe';

const makeFtyp = (brand: string): Uint8Array => {
  const bytes = new Uint8Array(24);
  bytes.set([0x00, 0x00, 0x00, 0x18]);
  bytes.set([...brand].map((char) => char.charCodeAt(0)), 8);
  bytes.set([...'ftyp'].map((char) => char.charCodeAt(0)), 4);
  return bytes;
};

describe('isHeicHeader', () => {
  it('detecta marcas HEIC/HEIF en la caja ftyp', () => {
    expect(isHeicHeader(makeFtyp('heic'))).toBe(true);
    expect(isHeicHeader(makeFtyp('heif'))).toBe(true);
    expect(isHeicHeader(makeFtyp('mif1'))).toBe(true);
  });

  it('no marca otros contenedores ISO-BMFF como HEIC', () => {
    expect(isHeicHeader(makeFtyp('avif'))).toBe(false);
    expect(isHeicHeader(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(false);
  });
});
