import { Routes, Route, Navigate } from 'react-router-dom';
import { Portfolio } from './Portfolio';
import { Business } from './Business';
import { Navbar } from './components/Navbar';
import { Inmobiliaria } from './demos/Inmobiliaria';
import { Profesional } from './demos/Profesional';
import { Gastronomia } from './demos/Gastronomia';
import { Comercio } from './demos/Comercio';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/business" element={<Business />} />
        <Route path="/business/inmobiliarias" element={<Inmobiliaria />} />
        <Route path="/business/profesionales" element={<Profesional />} />
        <Route path="/business/gastronomia" element={<Gastronomia />} />
        <Route path="/business/comercios" element={<Comercio />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
