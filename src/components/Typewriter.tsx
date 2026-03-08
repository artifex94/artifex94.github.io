import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: 'normal' | 'fast';
  className?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  delay = 0,
  speed = 'normal',
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  // Controlamos la visibilidad del cursor explícitamente
  const [showCursor, setShowCursor] = useState(false);
  
  // Usamos useRef para rastrear si ya empezó. 
  // Al ser una referencia, cambiar su valor NO provoca re-renderizados,
  // evitando que se cancele el timeout de escritura.
  const hasStartedRef = useRef(false);

  const ref = useRef<HTMLSpanElement>(null);
  
  // margin: "0px..." asegura que se detecte apenas entra en pantalla (o si ya está ahí)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });

  const [isFirstVisit] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('artifex_system_init');
    }
    return false;
  });

  // Lógica de inicialización
  useEffect(() => {
    if (isFirstVisit) {
      setShowCursor(true); // Mostrar cursor inmediatamente si es la primera visita
      sessionStorage.setItem('artifex_system_init', 'true');
    } else {
      setDisplayedText(text); // Mostrar todo el texto si ya visitó
      setShowCursor(false);   // Sin cursor
    }
  }, [isFirstVisit, text]);

  // Lógica de escritura
  useEffect(() => {
    // Solo iniciamos si:
    // 1. Es la primera visita
    // 2. El elemento es visible en pantalla
    // 3. No ha comenzado ya (verificado via ref)
    if (!isFirstVisit || !isInView || hasStartedRef.current) return;

    hasStartedRef.current = true; // Marcamos como iniciado sin re-renderizar
    
    let timeout: ReturnType<typeof setTimeout>;
    let currentIndex = 0;

    const startTyping = () => {
      const typeNextChar = () => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
          
          const baseSpeed = speed === 'fast' ? 10 : 50;
          const variance = speed === 'fast' ? 5 : 30;
          const nextDelay = baseSpeed + Math.random() * variance;
          
          timeout = setTimeout(typeNextChar, nextDelay);
        } else {
          // Terminó de escribir.
          // Dejamos el cursor parpadeando un breve tiempo (1s) y luego lo ocultamos.
          timeout = setTimeout(() => {
            setShowCursor(false);
          }, 1000);
        }
      };
      
      typeNextChar();
    };

    // Iniciamos la secuencia después del delay propuesto
    timeout = setTimeout(startTyping, delay * 1000);

    return () => clearTimeout(timeout);
  }, [text, delay, speed, isFirstVisit, isInView]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "circInOut" }}
          className="inline-block text-accent font-bold ml-[2px]"
        >
          _
        </motion.span>
      )}
    </span>
  );
};
