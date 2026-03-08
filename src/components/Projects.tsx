import React from 'react';
import { BlueprintBox } from './BlueprintBox';
import { data } from '../data/data';
import { ExternalLink, Github } from 'lucide-react';

export const Projects: React.FC = () => {
  return (
    <BlueprintBox coords={{ x: 50, y: 80 }} className="w-full">
      <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
        <span className="text-secondary text-sm">##</span> Deployed_Modules
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.projects.map((project, index) => (
          <div key={index} className="border border-dashed border-line p-5 bg-base/30 hover:bg-base/60 transition-colors flex flex-col h-full">
            
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-primary font-bold text-lg">{project.title}</h4>
              
              {/* Enlaces a código fuente o despliegue en vivo */}
              <div className="flex gap-3">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-secondary hover:text-accent transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-secondary hover:text-accent transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
            
            <p className="text-sm text-primary/70 mb-4 flex-grow">
              {project.description}
            </p>
            
            {/* Array de tecnologías renderizadas como pequeños bloques de datos */}
            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-dashed border-line/50">
              {project.technologies.map((tech, i) => (
                <span key={i} className="text-[10px] text-accent font-mono bg-accent/10 px-1.5 py-0.5 border border-accent/20">
                  {tech}
                </span>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </BlueprintBox>
  );
};