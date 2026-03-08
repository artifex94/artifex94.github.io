import React from 'react';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface BlueprintBoxProps {
  children: React.ReactNode;
  className?: string;
  coords?: { x: number; y: number };
  delay?: number; // Permite secuenciar la animación
}

export const BlueprintBox: React.FC<BlueprintBoxProps> = ({ 
  children, 
  className, 
  coords = { x: 10, y: 20 },
  delay = 0 
}) => {
  return (
    <motion.div 
      // Estados de animación: desenfocado y desplazado hacia abajo
      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
      // Estado final al entrar en la vista
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      // viewport asegura que la animación ocurra una vez y un poco antes de aparecer del todo
      viewport={{ once: true, margin: "-30px" }}
      // Configuración de la transición
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={cn(
        "relative border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8",
        className
      )}
    >
      {/* Marcadores de cruces en las esquinas */}
      <div className="absolute -top-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -top-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -bottom-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
      <div className="absolute -bottom-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>

      {/* Etiqueta técnica superior de coordenadas */}
      <div className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
        [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
      </div>

      {/* Contenido inyectado */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};