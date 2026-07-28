import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
// Fuente display de las páginas artísticas: al importarse acá, Vite la
// emite solo en este chunk (no pesa en home/desarrollo/portfolio).
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { ContactCTA } from '../components/ContactCTA';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import {
  AtelierFeltPanel,
  AtelierWoodFrame,
  YarnBallNumber,
} from '../components/tufting/Atelier';
import {
  atelierFeltPanelClass,
  atelierInteractiveClass,
  atelierPillClass,
  atelierPrimaryTagClass,
  clothBackground,
} from '../components/tufting/atelierMaterials';
import { FileteadoBanner, FileteadoCardRule, FileteadoCorner, FileteadoDivider, FileteadoOrnament } from '../components/tufting/Fileteado';
import { MagazineText } from '../components/tufting/MagazineText';
import { tuftingLines, tuftingCategories } from '../data/tufting';
import { usePageMeta } from '../hooks/usePageMeta';
import { breadcrumb } from '../data/structuredData';
import { cn } from '../utils/cn';

export const Tufting: React.FC = () => {
  const reduceMotion = useReducedMotion();

  usePageMeta({
    title: 'Tufting: Alfombras Artesanales en Victoria | Artifex',
    description:
      'Alfombras artesanales y tapices de tufting hechos a mano: piezas por encargo para hogar o negocio, colaboraciones con artistas y piezas únicas disponibles.',
    canonicalPath: '/servicios/tufting',
    // El nodo Service vive en el grafo base (structuredData.ts); acá solo el
    // breadcrumb propio de la página para no duplicar el @id #service-tufting.
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Tufting', path: '/servicios/tufting' },
    ]),
  });

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full overflow-x-hidden bg-atelier-cloth px-4 py-12 text-primary sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14 md:gap-[4.5rem] lg:gap-20">
        {/* Hero */}
        <section className="relative mx-auto w-full max-w-4xl py-10 text-center md:py-[4.5rem] lg:py-20">
          <span className={cn(atelierPillClass, 'mb-5 text-xs uppercase tracking-widest')}>
            Tufting · Alfombras y tapices artesanales · Victoria, Entre Ríos
          </span>
          <FileteadoBanner className="max-w-3xl">
            <h1 className="font-display text-[clamp(1.1rem,5.4cqw,3.1rem)] font-semibold leading-tight text-primary [text-shadow:0_1px_0_rgba(255,250,240,0.85),0_2px_8px_rgba(112,70,52,0.28)] sm:mb-[2.5cqw]">
              Un territorio de lana, <br />
              <span className="text-accent italic">tejido hilo por hilo.</span>
            </h1>
            <p className="mx-auto hidden max-w-[36em] text-[clamp(0.78rem,2cqw,1.05rem)] leading-relaxed text-primary/85 [text-shadow:0_1px_0_rgba(255,250,240,0.75)] sm:block">
              Alfombras y tapices únicos, hechos a mano con pistola de tufting. Encargá tu pieza,
              traé tu obra de artista o llevate una que ya está esperando pared.
            </p>
          </FileteadoBanner>
          {/* En mobile el campo del tapiz solo da para el titular: el párrafo baja acá. */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-primary/85 sm:hidden">
            Alfombras y tapices únicos, hechos a mano con pistola de tufting. Encargá tu pieza,
            traé tu obra de artista o llevate una que ya está esperando pared.
          </p>
        </section>

        {/* Manifiesto */}
        <AtelierFeltPanel framed className="p-7 text-left md:p-10">
          <FileteadoCorner className="pointer-events-none absolute left-4 top-4 h-20 w-20 opacity-35 md:h-24 md:w-24" />
          <FileteadoCorner className="pointer-events-none absolute bottom-4 right-4 h-20 w-20 opacity-30 md:h-24 md:w-24" flip="both" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <FileteadoCardRule className="mx-auto mb-5 max-w-sm opacity-80" />
            <h2 className="mb-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
              Tejemos <span className="text-accent italic">despacio</span>, para que dure una vida
            </h2>
            <MagazineText
              text="Cada alfombra nace de un dibujo y de miles de pasadas de lana, una por una, en un taller de acá. No hay dos iguales porque no hay dos manos iguales: lo que encargás se teje para vos, con oficio local y sin apuro. Una pieza que abriga la casa y también la historia de quien la hizo."
              ornament={<FileteadoOrnament className="w-full" />}
              ornamentSide="right"
              ornamentClassName="w-36 md:w-48"
              className="font-display text-lg leading-relaxed text-primary first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-accent md:text-xl"
            />
          </div>
        </AtelierFeltPanel>

        {/* Líneas accionables */}
        <section
          aria-labelledby="tufting-caminos"
          className="relative"
        >
          <div className="mb-10 text-center">
            <span className={cn(atelierPillClass, 'text-xs uppercase tracking-widest text-accent')}>
              <Sparkles size={14} aria-hidden="true" /> Elegí por dónde arrancar
            </span>
            <h2 id="tufting-caminos" className="mt-5 mb-3 font-display text-3xl font-semibold">
              Tres senderos que llevan a la misma lana
            </h2>
            <p className="mx-auto max-w-2xl text-secondary">
              Cada tarjeta es el primer paso de uno: el bastidor para presupuestar al toque, el
              formulario para obras compartidas, la tienda para piezas que ya existen.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {tuftingLines.map((line, index) => {
              return (
                <motion.div
                  key={line.title}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    to={line.href}
                    className={cn(
                      atelierFeltPanelClass,
                      atelierInteractiveClass,
                      'group flex h-full min-h-[20rem] flex-col p-7 focus-visible:rounded-[2rem]',
                    )}
                  >
                    <div aria-hidden="true" className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-accent/10 blur-2xl" />
                    <FileteadoCardRule className="pointer-events-none absolute inset-x-5 top-3 opacity-45 transition-opacity group-hover:opacity-65" />
                    <img
                      src={line.pictogram}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="relative mb-6 mt-9 h-20 w-20 object-contain drop-shadow-[0_10px_14px_rgba(112,70,52,0.22)] transition-transform duration-300 group-hover:-translate-y-0.5"
                    />
                    <h3 className="relative font-display text-2xl font-semibold mb-3">
                      {line.title}
                    </h3>
                    <p className="relative flex-1 text-sm leading-relaxed text-secondary">
                      {line.desc}
                    </p>
                    <div className="relative mt-7">
                      <FileteadoDivider className="mb-4 h-9 opacity-80" />
                      <span className={atelierPrimaryTagClass}>
                        {line.cta}
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Categorías */}
        <section>
          <div className="mb-12 text-center">
            <span className={cn(atelierPillClass, 'mb-4 min-h-0 px-4 py-2 text-xs uppercase tracking-widest')}>
              muestrario de lana
            </span>
            <h2 className="mb-3 font-display text-3xl font-semibold">Qué tejo</h2>
            <p className="mx-auto max-w-2xl text-secondary">
              Tres formatos para empezar; tu idea decide el resto.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {tuftingCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.1 }}
                className={cn(atelierFeltPanelClass, 'p-3')}
              >
                <AtelierWoodFrame className="rounded-[1.85rem] p-2">
                  <div className="relative overflow-hidden rounded-[1.35rem]" style={clothBackground}>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={
                          category.imageIsIllustration
                            ? `Ilustración tufteada: ${category.title}`
                            : `Pieza de tufting: ${category.title}`
                        }
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          'aspect-square w-full rounded-[1.2rem]',
                          category.imageIsIllustration ? 'object-contain p-6' : 'object-cover',
                        )}
                      />
                    ) : (
                      <ImagePlaceholder
                        label="Producto en proceso"
                        elegantLabel
                        className="atelier-felt aspect-square rounded-[1.2rem] border-0"
                      />
                    )}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[1rem] border border-dashed border-[color:rgba(253,249,243,0.72)] shadow-[inset_0_0_0_1px_rgba(43,35,32,0.08)]" />
                  </div>
                </AtelierWoodFrame>
                <div className="relative z-10 p-5">
                  <FileteadoCardRule className="mb-2 max-w-36 opacity-55" />
                  <h3 className="mb-2 font-display text-lg font-semibold">{category.title}</h3>
                  <p className="text-sm leading-relaxed text-secondary">{category.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Proceso breve */}
        <AtelierFeltPanel framed className="p-8 md:p-12">
          <FileteadoDivider className="mx-auto mb-4 max-w-xs opacity-75" />
          <h2 className="mb-8 text-center font-display text-2xl font-semibold">
            Si es por encargo, el camino es corto
          </h2>
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {[
              'Me contás tu idea: medidas, colores y dónde va a vivir. Sirve un boceto, una foto o una corazonada.',
              'Te mando el diseño digital y el presupuesto. Lo damos vuelta juntos hasta que sea el que imaginaste.',
              'La tejo a mano, punto por punto, y te la entrego terminada: con base y bordes rematados.',
            ].map((step, index) => (
              <div key={step} className="relative z-10">
                <YarnBallNumber value={index + 1} className="mb-4" />
                <p className="text-sm leading-relaxed text-secondary">{step}</p>
              </div>
            ))}
          </div>
        </AtelierFeltPanel>

        {/* CTA de cierre */}
        <AtelierFeltPanel className="mb-16 p-8 text-center md:p-12">
          <FileteadoCardRule className="mx-auto mb-4 max-w-sm opacity-70" />
          <h2 className="mb-3 font-display text-3xl font-semibold">¿Tejemos algo juntos?</h2>
          <p className="mb-8 text-secondary">
            Contanos qué imaginás: el bastidor ya está listo.
          </p>
          <ContactCTA service="tufting" emailSubject="Consulta - Tufting" rounded className="atelier-contact-cta" />
          <p className="relative z-10 mt-6 text-sm text-secondary">
            ¿Querés fotos profesionales de tus piezas?{' '}
            <Link to="/servicios/fotografia" className={cn(atelierPillClass, 'min-h-0 px-3 py-1 text-xs')}>
              Conocé el servicio de fotografía
            </Link>
          </p>
        </AtelierFeltPanel>
      </div>
    </motion.div>
  );
};
