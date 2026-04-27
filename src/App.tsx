import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Portfolio } from './Portfolio';
import { Business } from './Business';
import { Navbar } from './components/Navbar';
import { Inmobiliaria } from './demos/Inmobiliaria';
import { Profesional } from './demos/Profesional';
import { Gastronomia } from './demos/Gastronomia';
import { Comercio } from './demos/Comercio';
import { Emprendedor } from './demos/Emprendedor';
import { Empresa } from './demos/Empresa';

const DEMO_ROUTES = [
  '/business/inmobiliarias',
  '/business/profesionales',
  '/business/gastronomia',
  '/business/comercios',
  '/business/emprendedores',
  '/business/empresas',
];

function App() {
  const location = useLocation();
  const isDemo = DEMO_ROUTES.includes(location.pathname);

  return (
    <>
      {!isDemo && <Navbar />}
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/business" element={<Business />} />
        <Route path="/business/inmobiliarias" element={<Inmobiliaria />} />
        <Route path="/business/profesionales" element={<Profesional />} />
        <Route path="/business/gastronomia" element={<Gastronomia />} />
        <Route path="/business/comercios" element={<Comercio />} />
        <Route path="/business/emprendedores" element={<Emprendedor />} />
        <Route path="/business/empresas" element={<Empresa />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
