import React from 'react';
import { BlueprintBox } from './BlueprintBox';
import { data } from '../data/data';
import { Typewriter } from './Typewriter'; // <-- 1. Importar el componente

export const Experience: React.FC = () => {
  return (
    <BlueprintBox coords={{ x: 10, y: 15 }} className="w-full h-full">
      {/* 2. Reemplazar el texto estático por el Typewriter */}
      <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
        <span className="text-secondary text-sm">##</span> 
        <Typewriter text="Experiencia_Laboral" delay={0.5} speed="fast" />
      </h3>
      
      <div className="flex flex-col gap-6">
        {/* ... resto del código sin cambios ... */}
        {data.experience.map((exp, index) => (
          <div key={index} className="border-l border-dashed border-accent pl-4 relative">
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 bg-base border border-accent rounded-full" />
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h4 className="text-primary font-bold text-lg">{exp.role}</h4>
              <span className="text-xs text-secondary font-mono bg-line/20 px-2 py-1">
                {exp.period}
              </span>
            </div>
            <h5 className="text-accent/80 text-sm mb-3">{exp.company}</h5>
            <ul className="flex flex-col gap-2">
              {exp.description.map((item, i) => (
                <li key={i} className="text-sm text-primary/70 flex items-start gap-2">
                  <span className="text-secondary mt-0.5">&gt;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </BlueprintBox>
  );
};