import React from 'react';
import { BlueprintBox } from './BlueprintBox';
import { data } from '../data/data';

export const Education: React.FC = () => {
  return (
    <BlueprintBox coords={{ x: 30, y: 45 }} className="w-full h-full">
      <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
        <span className="text-secondary text-sm">##</span> Academic_Records
      </h3>
      
      <div className="flex flex-col gap-6">
        {data.education.map((edu, index) => (
          <div key={index} className="relative pl-4 border-l border-dotted border-secondary/50">
            {/* Marcador de lista estilo técnico */}
            <div className="absolute -left-[3px] top-2 w-1.5 h-1.5 bg-accent/50 rotate-45" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
              <h4 className="text-primary font-bold">{edu.degree}</h4>
              <span className="text-xs text-secondary font-mono mt-1 md:mt-0">
                [{edu.period}]
              </span>
            </div>
            
            <h5 className="text-accent/80 text-sm mb-2">{edu.institution}</h5>
            
            {edu.details && (
              <p className="text-sm text-primary/70 border-t border-dashed border-line/50 pt-2 mt-2">
                <span className="text-secondary mr-2">/&gt;</span>
                {edu.details}
              </p>
            )}
          </div>
        ))}
      </div>
    </BlueprintBox>
  );
};