import { describe, it, expect } from 'vitest';
import {
  website,
  person,
  org,
  baseGraph,
  serviceSchemas,
  withContext,
  breadcrumb,
  WEBSITE_ID,
  PERSON_ID,
  ORG_ID,
  serviceId,
} from './structuredData';
import { services } from './services';

describe('structuredData graph', () => {
  it('exposes the three base nodes with their expected @type', () => {
    expect(website['@type']).toBe('WebSite');
    expect(person['@type']).toBe('Person');
    expect(org['@type']).toBe('ProfessionalService');
    expect(baseGraph).toEqual([website, person, org]);
  });

  it('assigns stable, unique @ids across the base graph and services', () => {
    const ids = [
      ...baseGraph.map((n) => n['@id']),
      ...Object.values(serviceSchemas).map((n) => n['@id']),
    ];
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(WEBSITE_ID);
    expect(ids).toContain(PERSON_ID);
    expect(ids).toContain(ORG_ID);
  });

  it('links the base nodes to each other by @id without dangling refs', () => {
    expect(website.publisher).toEqual({ '@id': PERSON_ID });
    expect(person.worksFor).toEqual({ '@id': ORG_ID });
    expect(org.founder).toEqual({ '@id': PERSON_ID });
  });

  it('gives Person the three brand alternateName variants', () => {
    expect(person.alternateName).toEqual(
      expect.arrayContaining(['Ramiro Escobar', 'Ramiro Dev', 'Artifex']),
    );
  });

  it('models the org as a ProfessionalService with local areaServed', () => {
    expect(org['@type']).toBe('ProfessionalService');
    expect(org.areaServed).toEqual(expect.arrayContaining(['Victoria', 'Entre Ríos', 'Argentina']));
    expect(org.address).toMatchObject({
      addressLocality: 'Victoria',
      addressRegion: 'Entre Ríos',
      addressCountry: 'AR',
    });
  });

  it('produces one Service per hub service, each provided by the org', () => {
    expect(Object.keys(serviceSchemas)).toHaveLength(3);
    for (const service of services) {
      const node = serviceSchemas[service.id];
      expect(node).toBeDefined();
      expect(node['@type']).toBe('Service');
      expect(node['@id']).toBe(serviceId(service.id));
      expect(node.provider).toEqual({ '@id': ORG_ID });
      expect(node.areaServed).toEqual(
        expect.arrayContaining(['Victoria', 'Entre Ríos', 'Argentina']),
      );
    }
  });

  it('org offers reference the service @ids', () => {
    const offered = (org.makesOffer as Array<{ itemOffered: { '@id': string } }>).map(
      (o) => o.itemOffered['@id'],
    );
    for (const service of services) {
      expect(offered).toContain(serviceId(service.id));
    }
  });

  it('withContext wraps nodes in a single @graph document', () => {
    const doc = withContext(baseGraph) as Record<string, unknown>;
    expect(doc['@context']).toBe('https://schema.org');
    expect(doc['@graph']).toEqual(baseGraph);
    // Debe serializar sin ciclos (los enlaces son solo @id).
    expect(() => JSON.stringify(doc)).not.toThrow();
  });

  it('breadcrumb builds an ordered, absolute BreadcrumbList', () => {
    const crumb = breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Fotografía', path: '/servicios/fotografia' },
    ]) as Record<string, unknown>;
    expect(crumb['@type']).toBe('BreadcrumbList');
    expect(crumb.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://artifex.click/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Fotografía',
        item: 'https://artifex.click/servicios/fotografia',
      },
    ]);
  });
});
