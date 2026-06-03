import { Hero } from './components/Hero';
import { Experience } from './components/Experience';
import { Education } from './components/Education';
import { Projects } from './components/Projects';
import { BlueprintBox } from './components/BlueprintBox';
import { data } from './data/data';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Typewriter } from './components/Typewriter';

export const Portfolio = () => {
  return (
    <>
    <Helmet>
      <title>Perfil técnico — Ramiro Escobar | Artifex Dev</title>
      <meta name="description" content="Perfil técnico de Ramiro Escobar (Artifex Dev): experiencia, stack, proyectos y formación en desarrollo de software. React, TypeScript, Next.js." />
      <link rel="canonical" href="https://artifex.click/about" />
      <meta property="og:type" content="profile" />
      <meta property="og:title" content="Perfil técnico — Ramiro Escobar | Artifex Dev" />
      <meta property="og:url" content="https://artifex.click/about" />
      <meta property="og:locale" content="es_AR" />
    </Helmet>
    <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 1 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-8 md:bg-black/5 md:backdrop-blur-sm md:border md:border-white/[0.07] md:px-10 md:py-10">
        
        {/* Renderizado del Hero */}
        <Hero />

        {/* Grilla 1: Experiencia y Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3">
            <Experience />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Componente rápido de Skills inyectado en un BlueprintBox */}
            <BlueprintBox coords={{ x: 20, y: 30 }} className="flex-grow" delay={0.2}>
              <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                <span className="text-secondary text-sm">##</span> 
                <Typewriter text="System_Skills" delay={0.7} speed="fast" />
              </h3>
              
              <div className="flex flex-col gap-6">
                {data.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h4 className="text-sm text-secondary uppercase tracking-wider mb-3">
                      // {skillGroup.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.skills.map((skill, i) => (
                        <span 
                          key={i} 
                          className="text-xs text-primary border border-line bg-surface px-2 py-1 hover:border-accent hover:text-accent transition-colors cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BlueprintBox>
          </div>

        </div>

        {/* Grilla 2: Educación y Proyectos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <Education />
          </div>
          <div className="lg:col-span-2">
             <Projects />
          </div>
        </div>

        {/* Footer técnico animado */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-8 mb-4 border-t border-dashed border-line pt-6"
        >
           <p className="text-xs text-secondary font-mono">
             &gt; Artifex Dev Core // System Ready // {new Date().getFullYear()}
           </p>
        </motion.div>

      </div>
    </motion.div>
    </>
  );
};