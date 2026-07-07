import { describe, it, expect } from 'vitest';
import {
  website,
  person,
  org,
  baseGraph,
  serviceSchemas,
  withContext,
  breadcrumb,
  profilePageSchema,
  WEBSITE_ID,
  PERSON_ID,
  ORG_ID,
  serviceId,
} from './structuredData';
import { services } from './services';

describe('structuredData graph', () => {
  it('exposes the base nodes with their expected @type', () => {
    expect(website['@type']).toBe('WebSite');
    expect(person['@type']).toBe('Person');
    // El org es ProfessionalService + LocalBusiness (señales locales fuertes).
    expect(org['@type']).toEqual(['ProfessionalService', 'LocalBusiness']);
  });

  it('includes website, person, org and the three services in the base graph', () => {
    // Los Service viven en el grafo base para que org.makesOffer resuelva en
    // TODAS las rutas (antes quedaban colgantes fuera de Home).
    expect(baseGraph).toHaveLength(6);
    expect(baseGraph).toEqual(
      expect.arrayContaining([website, person, org, ...Object.values(serviceSchemas)]),
    );
  });

  it('assigns stable, unique @ids across the whole base graph', () => {
    const ids = baseGraph.map((n) => n['@id']);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(WEBSITE_ID);
    expect(ids).toContain(PERSON_ID);
    expect(ids).toContain(ORG_ID);
    for (const service of services) {
      expect(ids).toContain(serviceId(service.id));
    }
  });

  it('links the base nodes to each other by @id without dangling refs', () => {
    expect(website.publisher).toEqual({ '@id': PERSON_ID });
    expect(person.worksFor).toEqual({ '@id': ORG_ID });
    expect(org.founder).toEqual({ '@id': PERSON_ID });
  });

  it('gives Person the brand and per-craft alternateName variants', () => {
    expect(person.alternateName).toEqual(
      expect.arrayContaining([
        'Ramiro Escobar',
        'Ramiro Dev',
        'Artifex',
        'Artifex Dev',
        'Ramiro Fotografía',
        'Ramiro Tufting',
      ]),
    );
  });

  it('org logo points to a raster asset (Google does not accept SVG logos)', () => {
    expect(org.logo).toBe('https://artifex.click/apple-touch-icon.png');
  });

  it('profilePageSchema anchors /portfolio to the Person entity', () => {
    expect(profilePageSchema['@context']).toBe('https://schema.org');
    expect(profilePageSchema['@type']).toBe('ProfilePage');
    expect(profilePageSchema.mainEntity).toEqual({ '@id': PERSON_ID });
  });

  it('models the org as a local business with geo signals', () => {
    expect(org['@type']).toEqual(['ProfessionalService', 'LocalBusiness']);
    expect(org.areaServed).toEqual(expect.arrayContaining(['Victoria', 'Entre Ríos', 'Argentina']));
    expect(org.telephone).toBe('+5493436431987');
    expect(org.priceRange).toBe('$$');
    expect(org.geo).toMatchObject({
      '@type': 'GeoCoordinates',
      latitude: -32.6197,
      longitude: -60.156,
    });
    expect(org.openingHoursSpecification).toMatchObject({
      '@type': 'OpeningHoursSpecification',
      opens: '09:00',
      closes: '18:00',
    });
    expect(org.address).toMatchObject({
      addressLocality: 'Victoria',
      addressRegion: 'Entre Ríos',
      postalCode: '3153',
      addressCountry: 'AR',
    });
  });

  it('reinforces the tufting service for local rug/tapestry searches', () => {
    const tufting = serviceSchemas.tufting;
    expect(tufting.serviceType).toBe('Alfombras y tapices artesanales de tufting');
    expect(tufting.alternateName).toEqual(
      expect.arrayContaining(['Alfombras artesanales', 'Tapices artesanales', 'Tufting']),
    );
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
