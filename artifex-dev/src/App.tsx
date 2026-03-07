import { Hero } from './components/Hero';
import { Experience } from './components/Experience';
import { BlueprintBox } from './components/BlueprintBox';
import { data } from './data/data';

function App() {
  return (
    <div className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Contenedor principal para restringir el ancho y centrar */}
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Renderizado del Hero */}
        <Hero />

        {/* Grilla para dividir Experiencia y Skills (2 columnas en pantallas grandes) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          <div className="lg:col-span-3">
            <Experience />
          </div>

          <div className="lg:col-span-2">
            {/* Componente rápido de Skills inyectado en un BlueprintBox */}
            <BlueprintBox coords={{ x: 20, y: 30 }} className="h-full">
              <h3 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
                <span className="text-secondary text-sm">##</span> System_Skills
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
                          className="text-xs text-primary border border-line bg-base px-2 py-1 hover:border-accent hover:text-accent transition-colors cursor-default"
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

      </div>
    </div>
  );
}

export default App;