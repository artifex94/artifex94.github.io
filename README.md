# Artifex Dev — artifex.click

Sitio de Artifex Dev (Ramiro Aníbal Escobar): área comercial de servicios headless e-commerce como landing y portfolio profesional en su propia ruta.

## Stack

- React 19 + TypeScript + Vite 8 (Rolldown)
- Tailwind CSS v4 (tokens del theme en `src/index.css`, sin config JS)
- React Router 7 (`BrowserRouter`) + framer-motion

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # tsc + build de producción en dist/
npm run lint     # eslint
npm run preview  # sirve dist/ localmente
```

## Estructura

```
src/
├── pages/        # una página por área del sitio, cargadas lazy por ruta
├── components/   # componentes compartidos (Navbar, BlueprintBox, ...)
├── data/         # contenido separado de la UI (data.ts, business.ts)
└── index.css     # theme Blueprint: tokens de color y utilidades de la grilla
```

### Agregar una nueva área

1. Crear la página en `src/pages/NuevaArea.tsx` (named export).
2. Si tiene contenido propio, separarlo en `src/data/nueva-area.ts`.
3. Registrar la ruta lazy y el link del Navbar:
   - `src/App.tsx`: `const NuevaArea = lazy(() => import('./pages/NuevaArea').then((m) => ({ default: m.NuevaArea })))` + `<Route path="/nueva-area" ... />`
   - `src/components/Navbar.tsx`: agregar el `<Link>`.

Cada página es un chunk independiente: sumar áreas no afecta el peso inicial del sitio.

## Rutas

| Ruta         | Contenido                                  |
| ------------ | ------------------------------------------ |
| `/`          | Business (decisión de negocio: es la landing) |
| `/portfolio` | Portfolio profesional                      |
| `/business`  | Redirect a `/` (compatibilidad con links viejos) |
| `*`          | Redirect a `/`                             |

## Deploy

El mismo build se publica en dos hostings:

- **GitHub Pages** (`artifex94.github.io`): automático en cada push a `main` vía `.github/workflows/deploy.yml` (lint + build + publish a la rama `gh-pages`). El fallback SPA lo resuelve el par `public/404.html` + decoder en `index.html` ([técnica spa-github-pages](https://github.com/rafgraph/spa-github-pages)).
- **Hostinger** (`artifex.click`, dominio canónico): subida manual de `dist/`. El fallback SPA lo resuelve `public/.htaccess` (Apache).

El `<link rel="canonical">` apunta a `artifex.click` para consolidar el SEO en el dominio del negocio.
