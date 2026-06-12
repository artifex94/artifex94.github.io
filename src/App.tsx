import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';

// Cada área vive en src/pages y se carga on-demand: agregar una nueva
// no engorda el bundle inicial del resto del sitio.
const Business = lazy(() =>
  import('./pages/Business').then((m) => ({ default: m.Business }))
);
const Portfolio = lazy(() =>
  import('./pages/Portfolio').then((m) => ({ default: m.Portfolio }))
);

function App() {
  return (
    <>
      {/* El Navbar quedará fijo arriba y siempre visible */}
      <Navbar />
      <Suspense fallback={null}>
        <Routes>
          {/* Decisión de negocio: el prospecto que entra al sitio ve primero
              el área comercial; el portfolio queda en su propia ruta. */}
          <Route path="/" element={<Business />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* Compatibilidad con links a /business compartidos antes del cambio */}
          <Route path="/business" element={<Navigate to="/" replace />} />
          {/* Ruta de rescate: evita la pantalla en blanco si hay un error en la URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
