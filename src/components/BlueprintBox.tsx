import React, { useRef } from 'react';
import { cn } from '../utils/cn';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface BlueprintBoxProps {
  children: React.ReactNode;
  className?: string;
  coords?: { x: number; y: number };
  delay?: number;
}

export const BlueprintBox: React.FC<BlueprintBoxProps> = ({ 
  children, 
  className, 
  coords = { x: 10, y: 20 },
  delay = 0 
}) => {
  // Referencia al contenedor para calcular sus dimensiones exactas
  const ref = useRef<HTMLDivElement>(null);

  // Valores de movimiento para rastrear la posición X e Y del ratón
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Aplicamos un "resorte" (spring) a los valores para que el movimiento sea fluido y no robótico
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Transformamos la posición del ratón en grados de rotación.
  // Limitamos a 5 grados (-5deg a 5deg) para mantener la legibilidad profesional.
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // Función que se ejecuta al mover el ratón sobre la caja
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    
    // Calculamos la posición del ratón relativa a la caja
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalizamos los valores entre -0.5 y 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  // Función para resetear la rotación cuando el ratón sale de la caja
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      // Contenedor principal: Maneja la entrada general a la pantalla y la perspectiva 3D
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={cn("relative", className)}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        // Aplicamos la rotación 3D calculada por Framer Motion
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d" 
        }}
        // Añadimos una transición de color en el borde al hacer hover para reforzar la interactividad
        className="relative w-full h-full border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-accent/40"
      >
        {/* Marcadores de cruces en las esquinas */}
        {/* Usamos translateZ para que las cruces "floten" un poco por encima de la caja en 3D */}
        <div style={{ transform: "translateZ(20px)" }} className="absolute -top-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -top-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -bottom-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -bottom-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>

        {/* Etiqueta técnica superior de coordenadas */}
        <div style={{ transform: "translateZ(30px)" }} className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
          [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
        </div>

        {/* Contenido inyectado, elevado en el eje Z para crear efecto de profundidad (Parallax) */}
        <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};