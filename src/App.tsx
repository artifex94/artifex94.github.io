import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { baseGraph, withContext } from './data/structuredData';

const BASE_JSONLD_ATTR = 'data-base-jsonld';

// Inyecta el grafo base (WebSite + Person + ProfessionalService) una sola vez.
// A diferencia del JSON-LD por página (usePageMeta), este NO se limpia al
// navegar: las entidades del sitio son estables entre rutas.
function BaseStructuredData() {
  useEffect(() => {
    if (document.head.querySelector(`script[${BASE_JSONLD_ATTR}]`)) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute(BASE_JSONLD_ATTR, '');
    script.textContent = JSON.stringify(withContext(baseGraph));
    document.head.appendChild(script);
  }, []);
  return null;
}

// Cada área vive en src/pages y se carga on-demand: agregar una nueva
// no engorda el bundle inicial del resto del sitio.
const Home = lazy(() =>
  import('./pages/Home').then((m) => ({ default: m.Home }))
);
const Desarrollo = lazy(() =>
  import('./pages/Desarrollo').then((m) => ({ default: m.Desarrollo }))
);
const Fotografia = lazy(() =>
  import('./pages/Fotografia').then((m) => ({ default: m.Fotografia }))
);
const Tufting = lazy(() =>
  import('./pages/Tufting').then((m) => ({ default: m.Tufting }))
);
const Portfolio = lazy(() =>
  import('./pages/Portfolio').then((m) => ({ default: m.Portfolio }))
);
const Blog = lazy(() =>
  import('./pages/blog/Blog').then((m) => ({ default: m.Blog }))
);
const BlogCategory = lazy(() =>
  import('./pages/blog/BlogCategory').then((m) => ({ default: m.BlogCategory }))
);
const BlogPost = lazy(() =>
  import('./pages/blog/BlogPost').then((m) => ({ default: m.BlogPost }))
);
const NotFound = lazy(() =>
  import('./pages/NotFound').then((m) => ({ default: m.NotFound }))
);

// Demos por rubro: piezas de venta autocontenidas, cada una en su chunk
// porque los prospectos entran por link directo a UNA sola.
const Inmobiliaria = lazy(() =>
  import('./demos/Inmobiliaria').then((m) => ({ default: m.Inmobiliaria }))
);
const Profesional = lazy(() =>
  import('./demos/Profesional').then((m) => ({ default: m.Profesional }))
);
const Gastronomia = lazy(() =>
  import('./demos/Gastronomia').then((m) => ({ default: m.Gastronomia }))
);
const Comercio = lazy(() =>
  import('./demos/Comercio').then((m) => ({ default: m.Comercio }))
);
const Emprendedor = lazy(() =>
  import('./demos/Emprendedor').then((m) => ({ default: m.Emprendedor }))
);
const Empresa = lazy(() =>
  import('./demos/Empresa').then((m) => ({ default: m.Empresa }))
);

function App() {
  const { pathname } = useLocation();
  // Las demos son mini-sitios de venta sin el chrome de Artifex.
  // OJO: cualquier página real que se cree bajo /business/ quedaría sin
  // Navbar/Footer — ese prefijo está reservado para demos.
  const isDemo = pathname.startsWith('/business/');

  return (
    <>
      <ScrollToTop />
      <BaseStructuredData />
      {/* Navbar y Footer viven fuera de las rutas: conservan siempre la estética
          blueprint y funcionan como marco común entre los temas por servicio. */}
      {!isDemo && <Navbar />}
      <Suspense fallback={<div className="min-h-screen bg-base" aria-hidden="true" />}>
        <Routes>
          {/* La home es el hub de servicios: cada cliente entra al rubro que busca */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios/desarrollo" element={<Desarrollo />} />
          <Route path="/servicios/fotografia" element={<Fotografia />} />
          <Route path="/servicios/tufting" element={<Tufting />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:categorySlug" element={<BlogCategory />} />
          <Route path="/blog/:categorySlug/:postSlug" element={<BlogPost />} />
          {/* Demos: las URLs /business/* se mantienen porque ya circularon
              entre prospectos; no colisionan con el redirect exacto de /business */}
          <Route path="/business/inmobiliarias" element={<Inmobiliaria />} />
          <Route path="/business/profesionales" element={<Profesional />} />
          <Route path="/business/gastronomia" element={<Gastronomia />} />
          <Route path="/business/comercios" element={<Comercio />} />
          <Route path="/business/emprendedores" element={<Emprendedor />} />
          <Route path="/business/empresas" element={<Empresa />} />
          {/* El hub ES el índice de servicios: no duplicar contenido */}
          <Route path="/servicios" element={<Navigate to="/" replace />} />
          {/* Compatibilidad con links a /business compartidos antes del cambio */}
          <Route path="/business" element={<Navigate to="/servicios/desarrollo" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isDemo && <Footer />}
    </>
  );
}

export default App;
