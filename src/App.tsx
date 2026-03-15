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
        <Route path="/" element={<Portfolio />} />
        <Route path="/business" element={<Business />} />
        {/* Ruta de rescate: evita la pantalla en blanco si hay un error en la URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;