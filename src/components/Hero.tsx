import React from 'react';
import { BlueprintBox } from './BlueprintBox';
import { Terminal, Github, Linkedin, Mail } from 'lucide-react';
import { data } from '../data/data';
import { Typewriter } from './Typewriter'; // <-- Importamos nuestro nuevo componente

export const Hero: React.FC = () => {
  const { personal } = data;

  return (
    <BlueprintBox coords={{ x: 0, y: 0 }} className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        
        {/* Columna de texto */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="w-6 h-6 text-accent" />
            <span className="text-accent text-sm tracking-widest uppercase">
              {/* Alias tipeado inmediatamente */}
              <Typewriter text={personal.aka} delay={0.5} />
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 tracking-tight min-h-[80px] md:min-h-[60px]">
            {/* Nombre tipeado después del alias */}
            <Typewriter text={personal.name} delay={1.2} />
          </h1>
          
          <h2 className="text-lg md:text-xl text-secondary border-b border-dashed border-line pb-4 mb-4 min-h-[40px] md:min-h-[36px]">
            &gt; <Typewriter text={personal.title} delay={2.5} speed="fast" />
          </h2>
          
          <p className="text-primary/80 leading-relaxed text-sm md:text-base max-w-2xl min-h-[80px]">
            {/* Párrafo largo escrito rápidamente al final */}
            <Typewriter text={personal.aboutMe} delay={3.2} speed="fast" />
          </p>
        </div>

        {/* Columna de enlaces / Metadatos */}
        <div className="flex flex-col gap-3 w-full md:w-auto border border-dashed border-line p-4 bg-base/50">
          <p className="text-xs text-secondary mb-2 border-b border-dashed border-line pb-2">
            // CONNECTION_LINKS
          </p>
          <a href={personal.social.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a href={personal.social.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
          <a href={`mailto:${personal.emails.professional}`} className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors">
            <Mail className="w-4 h-4" /> {personal.emails.professional}
          </a>
        </div>
        
      </div>
    </BlueprintBox>
  );
};