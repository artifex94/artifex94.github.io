import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { 
  motion, 
  useMotionValue, 
  useSpring, 
  useTransform, 
  useScroll, 
  useVelocity 
} from 'framer-motion';

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
  const ref = useRef<HTMLDivElement>(null);

  // ==========================================
  // 1. LÓGICA DE ESCRITORIO (Ratón)
  // ==========================================
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateXDesktop = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateYDesktop = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  // ==========================================
  // 2. LÓGICA MÓVIL (Scroll Velocity)
  // ==========================================
  const { scrollY } = useScroll();
  // Extraemos la velocidad del scroll actual
  const scrollVelocity = useVelocity(scrollY);
  // Suavizamos esa velocidad para que el movimiento no sea brusco
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Transformamos la velocidad (-1000px/s a 1000px/s) en grados de rotación (X)
  // Esto hará que cabecee hacia arriba/abajo al hacer scroll rápido
  const rotateXMobile = useTransform(smoothVelocity, [-1000, 0, 1000], ["5deg", "0deg", "-5deg"]);

  // ==========================================
  // 3. DETECCIÓN DE ENTORNO
  // ==========================================
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Media query nativa para saber si el dispositivo carece de ratón
    const checkTouch = () => {
      setIsTouchDevice(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  // ==========================================
  // 4. MANEJADORES DE EVENTOS FILTRADOS
  // ==========================================
  // Usamos onPointerMove en lugar de onMouseMove para detectar el tipo de input
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // ¡CLAVE! Si el input es táctil (dedo), ignoramos el evento por completo
    if (e.pointerType !== "mouse") return;

    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={cn("relative", className)}
    >
      <motion.div
        ref={ref}
        // Asignamos los nuevos eventos Pointer
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ 
          // Asignamos dinámicamente el valor de rotación dependiendo del dispositivo
          rotateX: isTouchDevice ? rotateXMobile : rotateXDesktop, 
          rotateY: isTouchDevice ? 0 : rotateYDesktop, // En móvil solo rota en el eje X para el bamboleo
          transformStyle: "preserve-3d" 
        }}
        className="relative w-full h-full border border-dashed border-line bg-base/80 backdrop-blur-sm p-6 sm:p-8 transition-colors hover:border-accent/40"
      >
        <div style={{ transform: "translateZ(20px)" }} className="absolute -top-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -top-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -bottom-[5px] -left-[5px] text-accent text-xs opacity-80 leading-none">+</div>
        <div style={{ transform: "translateZ(20px)" }} className="absolute -bottom-[5px] -right-[5px] text-accent text-xs opacity-80 leading-none">+</div>

        <div style={{ transform: "translateZ(30px)" }} className="absolute -top-3 right-4 bg-base px-2 text-[10px] text-secondary border border-dashed border-line tracking-wider">
          [x:{coords.x.toString().padStart(2, '0')}, y:{coords.y.toString().padStart(2, '0')}]
        </div>

        <div style={{ transform: "translateZ(40px)" }} className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};