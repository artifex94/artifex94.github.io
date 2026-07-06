// Grafo de entidades schema.org (knowledge graph) enlazado por @id.
// El grafo base (WebSite + Person + ProfessionalService) se inyecta una vez
// desde App; cada página de servicio suma su nodo Service + un BreadcrumbList.
// Los @id son URIs estables: los demás nodos referencian con { '@id': ... }
// para que Google resuelva las entidades sin duplicarlas.
import { data } from './data';
import { CONTACT_EMAIL } from './contact';
import { services } from './services';

type JsonLdNode = Record<string, unknown>;

const BASE = 'https://artifex.click';
const OG_IMAGE = `${BASE}/og-image.png`;
const AREA_SERVED = ['Victoria', 'Entre Ríos', 'Argentina'];

export const WEBSITE_ID = `${BASE}/#website`;
export const PERSON_ID = `${BASE}/#person`;
export const ORG_ID = `${BASE}/#org`;
export const serviceId = (id: string) => `${BASE}/#service-${id}`;

const address: JsonLdNode = {
  '@type': 'PostalAddress',
  addressLocality: 'Victoria',
  addressRegion: 'Entre Ríos',
  addressCountry: 'AR',
};

const sameAs = [data.personal.social.github, data.personal.social.linkedin];

export const website: JsonLdNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${BASE}/`,
  name: 'Artifex',
  alternateName: ['Artifex Dev', 'Artifex - Ramiro Escobar'],
  inLanguage: 'es-AR',
  publisher: { '@id': PERSON_ID },
};

export const person: JsonLdNode = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: data.personal.name,
  // Cubre las variantes de búsqueda de marca personal (Ramiro Escobar / Dev / Artifex).
  alternateName: ['Ramiro Escobar', 'Ramiro Dev', 'Artifex'],
  jobTitle: data.personal.title,
  url: `${BASE}/portfolio`,
  image: OG_IMAGE,
  email: CONTACT_EMAIL,
  sameAs,
  knowsAbout: ['Desarrollo web', 'React', 'Next.js', 'TypeScript', 'Fotografía', 'Tufting'],
  address,
  worksFor: { '@id': ORG_ID },
};

export const org: JsonLdNode = {
  // ProfessionalService (subtipo de LocalBusiness): aporta señales geo/locales
  // sin exigir una vidriera física con horarios.
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'Artifex',
  url: `${BASE}/`,
  founder: { '@id': PERSON_ID },
  areaServed: AREA_SERVED,
  address,
  sameAs,
  logo: `${BASE}/favicon.svg`,
  image: OG_IMAGE,
  makesOffer: services.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@id': serviceId(s.id) },
  })),
};

// Nodos base que sobreviven a la navegación (inyectados una sola vez).
export const baseGraph: JsonLdNode[] = [website, person, org];

// Un Service por servicio del hub. Se inyectan por página (no en el grafo base),
// como scripts autónomos, por eso llevan su propio @context.
export const serviceSchemas: Record<string, JsonLdNode> = Object.fromEntries(
  services.map((s) => [
    s.id,
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': serviceId(s.id),
      name: s.title,
      serviceType: s.title,
      description: s.description,
      url: `${BASE}${s.href}`,
      provider: { '@id': ORG_ID },
      areaServed: AREA_SERVED,
    },
  ]),
);

// Envuelve nodos en un único documento JSON-LD con @graph.
export const withContext = (nodes: JsonLdNode[]): JsonLdNode => ({
  '@context': 'https://schema.org',
  '@graph': nodes,
});

export interface BreadcrumbItem {
  name: string;
  /** Ruta relativa ('/servicios/fotografia'); '/' para el inicio. */
  path: string;
}

// BreadcrumbList autónomo (con @context) para inyectar vía usePageMeta.
export const breadcrumb = (items: BreadcrumbItem[]): JsonLdNode => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${BASE}${item.path === '/' ? '/' : item.path}`,
  })),
});
