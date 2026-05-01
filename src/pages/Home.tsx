import { Hero } from '../components/Hero';
import { Experience } from '../components/Experience';
import { Education } from '../components/Education';
import { Projects } from '../components/Projects';
import { Skills } from '../components/Skills';

export const Home = () => {
  return (
    <main className="w-full bg-blueprint-grid py-12">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 
          Contenedor Principal de la Grilla.
          - Por defecto (móvil): se apila verticalmente con flex-col.
          - En 'xl' (1280px+): se transforma en una grilla de 12 columnas.
        */}
        <div className="flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:grid-rows-[auto_1fr] xl:gap-8">
          
          {/* Fila 1, Izquierda: Hero (ocupa 8 columnas) */}
          <div className="xl:col-span-8 xl:row-span-1 flex flex-col min-w-0">
            <Hero />
          </div>

          {/* Panel Derecho: Projects (ocupa 4 columnas y 2 filas de alto) */}
          <div className="xl:col-start-9 xl:col-span-4 xl:row-span-2 flex flex-col min-w-0">
            <Projects />
          </div>

          {/* Fila 2, Izquierda: Experience (ocupa 3 columnas) */}
          <div className="xl:col-span-3 xl:row-start-2 flex flex-col min-w-0">
            <Experience />
          </div>

          {/* Fila 2, Centro: Skills (ocupa 2 columnas) */}
          <div className="xl:col-span-2 xl:row-start-2 flex flex-col min-w-0">
            <Skills />
          </div>

          {/* Fila 2, Derecha: Education (ocupa 3 columnas) */}
          <div className="xl:col-span-3 xl:row-start-2 flex flex-col min-w-0">
            <Education />
          </div>

        </div>
      </div>
    </main>
  );
};