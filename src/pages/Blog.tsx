import { motion } from 'framer-motion';
import { BlueprintBox } from '../components/BlueprintBox';
import { BookOpen, Cpu, FlaskConical, Clock } from 'lucide-react';

interface BlogCategory {
  icon: React.ElementType;
  slug: string;
  title: string;
  desc: string;
  count: number;
  available: boolean;
}

const categories: BlogCategory[] = [
  {
    icon: BookOpen,
    slug: 'apuntes',
    title: 'Apuntes',
    desc: 'Notas técnicas, conceptos de ingeniería y recursos de estudio. Lo que aprendo, documentado.',
    count: 0,
    available: false,
  },
  {
    icon: Cpu,
    slug: 'tecnologias',
    title: 'Tecnologías',
    desc: 'Exploraciones prácticas de herramientas, frameworks y stacks. Opiniones basadas en uso real.',
    count: 0,
    available: false,
  },
  {
    icon: FlaskConical,
    slug: 'implementaciones',
    title: 'Implementaciones',
    desc: 'Casos de uso concretos, integraciones y soluciones a problemas reales de desarrollo.',
    count: 0,
    available: false,
  },
];

export const Blog = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <BlueprintBox coords={{ x: 5, y: 5 }} className="w-full">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-accent shrink-0 mt-1" />
            <div>
              <p className="text-secondary text-xs font-mono tracking-widest uppercase mb-1">// Knowledge_Base</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight">
                Blog & Notas
              </h1>
              <p className="text-[#c0c0c0] text-sm md:text-base leading-relaxed max-w-2xl">
                Apuntes de estudio, exploraciones técnicas e implementaciones que vale la pena documentar.
                Sin pretensiones — esto es un registro de lo que aprendo mientras lo aprendo.
              </p>
            </div>
          </div>
        </BlueprintBox>

        {/* Categorías */}
        <section>
          <p className="text-secondary text-xs font-mono mb-6">// CATEGORÍAS</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map(({ icon: Icon, title, desc, count, available }, idx) => (
              <div
                key={idx}
                className={`border border-dashed border-line p-6 bg-surface/30 flex flex-col gap-4 transition-colors ${
                  available
                    ? 'hover:border-accent hover:bg-surface/60 cursor-pointer'
                    : 'opacity-60 cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-6 h-6 text-accent/60" />
                  {!available && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-secondary border border-line px-2 py-0.5">
                      <Clock className="w-3 h-3" /> Próximamente
                    </span>
                  )}
                  {available && (
                    <span className="text-[10px] font-mono text-secondary">{count} entradas</span>
                  )}
                </div>
                <div>
                  <h3 className="text-primary font-bold mb-2">{title}</h3>
                  <p className="text-sm text-[#aaaaaa] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Estado vacío */}
        <BlueprintBox coords={{ x: 50, y: 70 }} className="w-full">
          <div className="text-center py-10">
            <p className="text-secondary text-xs font-mono mb-3">// STATUS: INITIALIZING</p>
            <p className="text-[#909090] text-sm max-w-md mx-auto leading-relaxed">
              Las secciones están estructuradas y listas para recibir contenido.
              Las primeras entradas van a aparecer acá cuando estén publicadas.
            </p>
          </div>
        </BlueprintBox>

      </div>
    </motion.div>
  );
};
