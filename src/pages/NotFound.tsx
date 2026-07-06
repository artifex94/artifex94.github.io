import { Link } from 'react-router-dom';
import { BlueprintBox } from '../components/BlueprintBox';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFound = () => {
  usePageMeta({
    title: 'Página no encontrada — Artifex',
    description: 'La página que buscás no existe. Volvé al inicio de Artifex.',
    noindex: true,
  });

  return (
  <div className="min-h-screen flex items-center justify-center px-4">
    <BlueprintBox coords={{ x: 40, y: 40 }} className="max-w-md w-full">
      <p className="text-[9px] font-mono text-secondary/50 uppercase tracking-widest mb-2">// 404_NOT_FOUND</p>
      <h1 className="text-5xl font-bold text-accent font-mono mb-3">404</h1>
      <p className="text-primary font-bold mb-1">Página no encontrada</p>
      <p className="text-secondary text-xs leading-relaxed mb-6">
        La ruta que buscás no existe en este repositorio.
      </p>
      <Link
        to="/"
        className="text-xs font-mono border border-dashed border-accent/50 px-4 py-2 text-accent hover:bg-accent hover:text-black transition-colors inline-block"
      >
        ← Volver al inicio
      </Link>
    </BlueprintBox>
  </div>
  );
};
