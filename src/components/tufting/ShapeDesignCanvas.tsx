import React, { useEffect, useMemo, useRef, useState } from 'react';
import { composeShapeDesign, type ComposeShape } from '../../utils/shapeComposer';
import { cn } from '../../utils/cn';

interface ShapeDesignCanvasProps {
  shape: ComposeShape;
  pieceWidthCm: number;
  pieceHeightCm: number;
  fillColor: string;
  borderColor: string;
  borderThick: boolean;
  rotationDeg: number;
  imageUrl?: string;
  className?: string;
}

interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
  url: string;
}

// Preview vivo del diseñador de formas simples.
// Usa el mismo compositor que el export para que el bastidor muestre exactamente
// la pieza que viaja después en el encargo.
export const ShapeDesignCanvas: React.FC<ShapeDesignCanvasProps> = ({
  shape,
  pieceWidthCm,
  pieceHeightCm,
  fillColor,
  borderColor,
  borderThick,
  rotationDeg,
  imageUrl,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setLoadedImage({
        image,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        url: imageUrl,
      });
    };
    image.onerror = () => {
      if (!cancelled) setLoadedImage(null);
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measure = () => {
      const rect = wrapper.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const imageForCompose = loadedImage?.url === imageUrl ? loadedImage : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || size.width <= 0 || size.height <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(size.width * dpr));
    canvas.height = Math.max(1, Math.round(size.height * dpr));
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    composeShapeDesign(ctx, size.width, size.height, {
      shape,
      pieceWidthCm,
      pieceHeightCm,
      fillColor,
      borderColor,
      borderThick,
      rotationDeg,
      image: imageForCompose?.image ?? null,
      imageWidth: imageForCompose?.width,
      imageHeight: imageForCompose?.height,
    });
  }, [
    shape,
    pieceWidthCm,
    pieceHeightCm,
    fillColor,
    borderColor,
    borderThick,
    rotationDeg,
    imageForCompose,
    size,
  ]);

  const ariaLabel = useMemo(() => {
    const shapeLabel = shape === 'circular' ? 'circular u ovalada' : 'rectangular';
    const borderLabel = borderThick ? 'borde grueso' : 'borde normal';
    return `Previsualización de alfombra ${shapeLabel} de ${Math.round(pieceWidthCm)} por ${Math.round(
      pieceHeightCm,
    )} centímetros, con ${borderLabel}.`;
  }, [shape, pieceWidthCm, pieceHeightCm, borderThick]);

  return (
    <div ref={wrapperRef} className={cn('relative w-full h-full min-h-0', className)}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} className="block w-full h-full" />
    </div>
  );
};
