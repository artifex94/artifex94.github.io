import React, { useRef } from 'react';
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
  // 1. LÓGICA DE PUNTERO (Ratón y Táctil)
  // ==========================================
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  // Calculamos grados numéricos (sin "deg") para poder sumarlos después
  const rotateXPointer = useTransform(mouseYSpring, [-0.5, 0.5], [5, -5]);
  const rotateYPointer = useTransform(mouseXSpring, [-0.5, 0.5], [-5, 5]);

  // ==========================================
  // 2. LÓGICA DE SCROLL (Velocidad)
  // ==========================================
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  
  // Calculamos grados numéricos basados en la velocidad del scroll
  const rotateXScroll = useTransform(smoothVelocity, [-1000, 0, 1000], [5, 0, -5]);

  // ==========================================
  // 3. COMBINACIÓN DE EFECTOS
  // ==========================================
  // Sumamos la rotación del puntero + la del scroll para el eje X
  const rotateX = useTransform(
    [rotateXPointer, rotateXScroll],
    ([pointer, scroll]: any[]) => `${pointer + scroll}deg`
  );
  
  // El eje Y solo responde al puntero (mouse/dedo)
  const rotateY = useTransform(rotateYPointer, (val) => `${val}deg`);

  // ==========================================
  // 4. MANEJADORES DE EVENTOS
  // ==========================================
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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

  const handlePointerReset = () => {
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerReset}
        onPointerUp={handlePointerReset}     // Reset al levantar el dedo (permite clic)
        onPointerCancel={handlePointerReset} // Reset si el navegador toma el control (scroll nativo)
        style={{ 
          rotateX, 
          rotateY,
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