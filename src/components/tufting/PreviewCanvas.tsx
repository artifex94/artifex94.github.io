import React, { useEffect, useRef } from 'react';

interface PreviewCanvasProps {
  rgba: Uint8ClampedArray;
  width: number;
  height: number;
  className?: string;
}

// Vuelca la previsualización ya calculada a un canvas.
//
// El dibujo es 100% algorítmico: cada píxel es el color de una lana real que hay
// en el taller, elegida por cercanía perceptual. No interviene ningún modelo
// generativo, así que lo que se ve es exactamente lo que se puede tejer.
export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  rgba,
  width,
  height,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    canvas.width = width;
    canvas.height = height;
    // El buffer puede venir transferido desde el worker: se copia para que
    // ImageData no se quede con una referencia que después se reutiliza.
    context.putImageData(new ImageData(new Uint8ClampedArray(rgba), width, height), 0, 0);
  }, [rgba, width, height]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Previsualización de tu alfombra con los colores de lana disponibles"
      className={className}
    />
  );
};
