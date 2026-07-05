# Artifex — artifex.click

Sitio de Artifex (Ramiro Aníbal Escobar): hub de servicios con tres rubros —desarrollo e-commerce headless, fotografía y tufting— más el portfolio profesional en su propia ruta.

## Stack

- React 19 + TypeScript + Vite 8 (Rolldown)
- Tailwind CSS v4 (tokens del theme en `src/index.css`, sin config JS)
- React Router 7 (`BrowserRouter`) + framer-motion
- Fraunces Variable (`@fontsource-variable/fraunces`) solo en las páginas artísticas

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # tsc + build de producción en dist/ (genera sitemap.xml y rss.xml)
npm run lint     # eslint
npm run test     # vitest en modo watch
npm run test:run # vitest una sola vez (lo corre el CI)
npm run coverage # cobertura de tests
npm run preview  # sirve dist/ localmente
```

## Estructura

```
src/
├── pages/        # una página por área del sitio, cargadas lazy por ruta
│   └── blog/     # índice, categoría y post del blog (contenido en data/blog.ts)
├── demos/        # mini-sitios de venta por rubro (/business/*), sin chrome del sitio
├── components/   # componentes compartidos (Navbar, Footer, BlueprintBox, gallery/, ...)
├── data/         # contenido separado de la UI (contact.ts, blog.ts, photography.ts, ...)
├── hooks/        # usePageMeta (SEO por ruta + JSON-LD)
├── test/         # setup de vitest (mock de framer-motion) y render con providers
└── index.css     # theme Blueprint + temas por servicio ([data-theme=...])
public/
└── photos/       # imágenes de fotografía y tufting, por categoría
```

## Rutas

| Ruta                     | Contenido                                        |
| ------------------------ | ------------------------------------------------ |
| `/`                      | Home hub: presentación + cards de los 3 servicios |
| `/servicios/desarrollo`  | Desarrollo e-commerce headless (planes y proceso) |
| `/servicios/fotografia`  | Fotografía: galería, categorías y paquetes        |
| `/servicios/tufting`     | Tufting: líneas de servicio y piezas              |
| `/portfolio`             | Portfolio profesional                             |
| `/blog`                  | Blog & Notas (índice con buscador)                |
| `/blog/:cat`             | Posts por categoría                               |
| `/blog/:cat/:post`       | Post individual (JSON-LD BlogPosting)             |
| `/business/<rubro>`      | Demos de venta (inmobiliarias, gastronomía, ...)  |
| `/servicios`             | Redirect a `/` (el hub es el índice)              |
| `/business`              | Redirect a `/servicios/desarrollo` (links viejos) |
| `*`                      | Página 404                                        |

Las demos (`/business/*`) se muestran **sin** Navbar/Footer del sitio: ese prefijo
queda reservado para mini-sitios de venta. El contenido del blog vive en
`src/data/blog.ts` (posts como data tipada; los `draft` no se publican ni entran
al sitemap/RSS, que se regeneran en cada build desde `vite.config.ts`).

## Contacto (WhatsApp + email)

Todo el contacto se centraliza en `src/data/contact.ts`:

- **Email**: `CONTACT_EMAIL` es la única fuente (los mailto se arman con `buildMailto`).
- **WhatsApp**: completar `WHATSAPP_NUMBER` con el número en formato internacional
  sin `+` ni guiones (Argentina: `549` + área + número, sin el 15; ej. `5492611234567`).
  Mientras esté vacío, los botones de WhatsApp no se renderizan y el sitio degrada a email.
  Los mensajes prellenados por servicio viven en `whatsappMessages`.

## Cómo agregar fotos a la galería

1. Optimizar la imagen: **WebP, lado mayor ≤1600px, calidad ~80** (objetivo <300KB).
2. Guardarla en `public/photos/<categoria>/` con nombre descriptivo en kebab-case
   (ej. `public/photos/retratos/book-teatro-mendoza-01.webp`). El nombre descriptivo suma al SEO de imagen.
3. Agregar la entrada en `galleryPhotos` (`src/data/photography.ts`) con `src`, `alt`
   descriptivo, `category` y las **dimensiones reales en píxeles** (evitan saltos de layout).

Para piezas de tufting: igual, pero en `public/photos/tufting/` y seteando `image` en la
pieza correspondiente de `src/data/tufting.ts` (sin `image` se muestra un placeholder).

## Temas por servicio

La base es el theme Blueprint (oscuro, naranja, monospace). Las páginas artísticas
envuelven su contenido en `data-theme="fotografia"` (oscuro cálido, ámbar) o
`data-theme="tufting"` (crema, terracota): los bloques `[data-theme=...]` de
`src/index.css` sobrescriben los tokens `--color-*` y todas las utilidades se
re-skinean solas. Navbar y Footer quedan fuera del subtree: siempre blueprint,
como marco común. Para ajustar un tema, editar solo su bloque de variables.

### Agregar una nueva área

1. Crear la página en `src/pages/NuevaArea.tsx` (named export).
2. Si tiene contenido propio, separarlo en `src/data/nueva-area.ts`.
3. Registrar la ruta lazy y el link del Navbar:
   - `src/App.tsx`: `const NuevaArea = lazy(() => import('./pages/NuevaArea').then((m) => ({ default: m.NuevaArea })))` + `<Route path="/nueva-area" ... />`
   - `src/components/Navbar.tsx`: agregar la entrada en `navItems`.
4. Si es un servicio, sumarlo también a `src/data/services.ts` (card del hub) y,
   opcionalmente, darle su propio `[data-theme=...]` en `src/index.css`.

Cada página es un chunk independiente: sumar áreas no afecta el peso inicial del sitio.

## Deploy

El mismo build se publica en dos hostings:

- **GitHub Pages** (`artifex94.github.io`): automático en cada push a `main` vía `.github/workflows/deploy.yml` (lint + build + publish a la rama `gh-pages`). El fallback SPA lo resuelve el par `public/404.html` + decoder en `index.html` ([técnica spa-github-pages](https://github.com/rafgraph/spa-github-pages)).
- **Hostinger** (`artifex.click`, dominio canónico): subida manual de `dist/`. El fallback SPA lo resuelve `public/.htaccess` (Apache).

El `<link rel="canonical">` apunta a `artifex.click`; `usePageMeta` lo ajusta por ruta en el cliente.
