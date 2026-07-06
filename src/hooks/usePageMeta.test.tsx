import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { usePageMeta } from './usePageMeta';

// Sonda mínima: monta el hook con las props del caso y no pinta nada.
const Probe = (props: Parameters<typeof usePageMeta>[0]) => {
  usePageMeta(props);
  return null;
};

const content = (selector: string) =>
  document.head.querySelector<HTMLMetaElement>(selector)?.getAttribute('content');

describe('usePageMeta', () => {
  beforeEach(() => {
    // jsdom no carga index.html: partimos de un <head> limpio en cada caso.
    document.head.innerHTML = '';
  });

  it('sets title and upserts Open Graph, Twitter and robots meta', () => {
    render(
      <Probe
        title="Fotografía — Artifex"
        description="Fotografía en Victoria."
        canonicalPath="/servicios/fotografia"
        image="https://artifex.click/custom.png"
      />,
    );

    expect(document.title).toBe('Fotografía — Artifex');
    expect(content('meta[property="og:title"]')).toBe('Fotografía — Artifex');
    expect(content('meta[property="og:description"]')).toBe('Fotografía en Victoria.');
    expect(content('meta[property="og:url"]')).toBe(
      'https://artifex.click/servicios/fotografia',
    );
    expect(content('meta[property="og:image"]')).toBe('https://artifex.click/custom.png');
    expect(content('meta[property="og:type"]')).toBe('website');
    expect(content('meta[name="twitter:title"]')).toBe('Fotografía — Artifex');
    expect(content('meta[name="twitter:image"]')).toBe('https://artifex.click/custom.png');
    // Páginas indexables piden max-image-preview:large para que Google muestre
    // el trabajo fotográfico a tamaño completo en resultados.
    expect(content('meta[name="robots"]')).toBe('index, follow, max-image-preview:large');
  });

  it('truncates the description at a word boundary for the meta tags', () => {
    document.head.innerHTML = '<meta name="description" content="old" />';
    const long = 'a'.repeat(120) + ' palabra-que-se-corta ' + 'b'.repeat(60);
    render(<Probe title="t" description={long} canonicalPath="/" />);
    const desc = content('meta[name="description"]');
    expect(desc).toBeDefined();
    expect(desc!.length).toBeLessThanOrEqual(160);
    expect(desc!.endsWith('…')).toBe(true);
    // No corta a mitad de palabra: el fragmento final entero no aparece.
    expect(desc).not.toContain('bbbbbb');
  });

  it('emits article:published_time and article:modified_time for ogType article', () => {
    render(
      <Probe
        title="Post"
        description="d"
        canonicalPath="/blog/x/y"
        ogType="article"
        articlePublishedTime="2026-04-20"
        articleModifiedTime="2026-04-22"
      />,
    );
    expect(content('meta[property="og:type"]')).toBe('article');
    expect(content('meta[property="article:published_time"]')).toBe('2026-04-20');
    expect(content('meta[property="article:modified_time"]')).toBe('2026-04-22');
  });

  it('removes article:* meta when navigating to a page without them', () => {
    document.head.innerHTML =
      '<meta property="article:published_time" content="2026-01-01" />';
    render(<Probe title="t" description="d" canonicalPath="/" />);
    expect(document.head.querySelector('meta[property="article:published_time"]')).toBeNull();
  });

  it('falls back to the default og-image when none is passed', () => {
    render(<Probe title="Home" description="Taller" canonicalPath="/" />);
    expect(content('meta[property="og:image"]')).toBe('https://artifex.click/og-image.png');
    expect(content('meta[property="og:url"]')).toBe('https://artifex.click/');
  });

  it('emits noindex when requested', () => {
    render(<Probe title="404" description="No existe" noindex />);
    expect(content('meta[name="robots"]')).toBe('noindex, follow');
  });

  it('reuses an existing twitter meta declared with property= (no duplicate)', () => {
    document.head.innerHTML =
      '<meta property="twitter:title" content="old" />';
    render(<Probe title="Nuevo título" description="x" canonicalPath="/" />);

    const twitterTitles = document.head.querySelectorAll(
      'meta[property="twitter:title"], meta[name="twitter:title"]',
    );
    expect(twitterTitles).toHaveLength(1);
    expect(twitterTitles[0].getAttribute('content')).toBe('Nuevo título');
  });

  it('updates existing description and canonical when present', () => {
    document.head.innerHTML =
      '<meta name="description" content="old" /><link rel="canonical" href="old" />';
    render(
      <Probe title="t" description="nueva desc" canonicalPath="/servicios/tufting" />,
    );
    expect(content('meta[name="description"]')).toBe('nueva desc');
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://artifex.click/servicios/tufting',
    );
  });

  it('injects page JSON-LD and removes it on unmount', () => {
    const { unmount } = render(
      <Probe
        title="t"
        description="d"
        canonicalPath="/"
        jsonLd={[{ '@type': 'Service', name: 'X' }]}
      />,
    );
    const scripts = document.head.querySelectorAll('script[data-page-jsonld]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].textContent).toContain('"Service"');

    unmount();
    expect(document.head.querySelectorAll('script[data-page-jsonld]')).toHaveLength(0);
  });
});
