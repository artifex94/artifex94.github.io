import React from 'react';
import { cn } from '../utils/cn';

interface BlueprintBoxProps {
  children: React.ReactNode;
  className?: string;
  coords?: { x: number; y: number }; // Simulación de coordenadas de plano
}

export const BlueprintBox: React.FC<BlueprintBoxProps> = ({ 
  children, 
  className, 
  coords = { x: 10, y: 20 } 
}) => {
  return (
    <div className={cn(
      "relative border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8",
      className
    )}>
      {/* Marcadores de cruces en las esquinas simulando un plano arquitectónico */}
      <div className="absolute -top-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -top-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -bottom-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -bottom-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>

      {/* Etiqueta técnica superior de coordenadas */}
      <div className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
        [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
      </div>

      {/* Contenido inyectado a través del patrón Slot */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};