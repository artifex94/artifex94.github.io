import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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

function App() {
  return (
    <>
      {/* Navbar y Footer viven fuera de las rutas: conservan siempre la estética
          blueprint y funcionan como marco común entre los temas por servicio. */}
      <Navbar />
      <Suspense fallback={null}>
        <Routes>
          {/* La home es el hub de servicios: cada cliente entra al rubro que busca */}
          <Route path="/" element={<Home />} />
          <Route path="/servicios/desarrollo" element={<Desarrollo />} />
          <Route path="/servicios/fotografia" element={<Fotografia />} />
          <Route path="/servicios/tufting" element={<Tufting />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* El hub ES el índice de servicios: no duplicar contenido */}
          <Route path="/servicios" element={<Navigate to="/" replace />} />
          {/* Compatibilidad con links a /business compartidos antes del cambio */}
          <Route path="/business" element={<Navigate to="/servicios/desarrollo" replace />} />
          {/* Ruta de rescate: evita la pantalla en blanco si hay un error en la URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
}

export default App;
