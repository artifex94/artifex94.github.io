import { Routes, Route, Navigate } from 'react-router-dom';
import { Portfolio } from './Portfolio';
import { Business } from './Business';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <>
      {/* El Navbar quedará fijo arriba y siempre visible */}
      <Navbar />
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
    </>
  );
}

export default App;