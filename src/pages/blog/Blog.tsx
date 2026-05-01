import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BookOpen, ArrowRight, Clock, Tag, Heart, ExternalLink, Search, X } from 'lucide-react';
import { BlueprintBox } from '../../components/BlueprintBox';
import { categories, getAllPublished, getRecentPosts, countByCategory, getCategoryBySlug } from '../../data/blog';

const CAFECITO_URL = "https://cafecito.app/artifex";
const MATECITO_URL = "https://matecito.app/artifex"; // actualizar cuando esté validado

const DonationsSection = () => (
  <BlueprintBox coords={{ x: 80, y: 90 }} delay={0.4} className="w-full">
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-secondary text-xs font-mono mb-1">// SUPPORT_MODULE</p>
        <h2 className="text-xl font-bold text-primary mb-2">Si el contenido te sirvio, considerá invitarme algo</h2>
        <p className="text-sm text-primary/60 leading-relaxed max-w-2xl">
          Este blog no tiene publicidad, no tiene paywall y nunca va a tener.
          Cada articulo lleva horas de investigación, prueba y escritura — y lo comparto libre porque creo
          que el conocimiento tiene que circular. Si algo de lo que escribi te ahorro tiempo, te destrabo
          un problema o simplemente te gusto, podes devolver un poco de esa energía aca abajo.
          Cualquier colaboración, por mínima que sea, significa muchísimo y me motiva a seguir publicando.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cafecito */}
        <a
          href={CAFECITO_URL}
          target="_blank"
          rel="noreferrer"
          className="group border border-dashed border-line p-5 bg-[#0f0f0f] hover:bg-[#181818] hover:border-[#E67E32] transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#E67E32]/60 group-hover:text-[#E67E32] transition-colors" />
              <span className="font-bold text-primary group-hover:text-[#E67E32] transition-colors">Cafecito</span>
            </div>
            <span className="text-[10px] font-mono border border-[#E67E32]/40 text-[#E67E32] bg-[#E67E32]/10 px-2 py-0.5">
              En pesos, facil
            </span>
          </div>
          <p className="text-xs text-primary/50 leading-relaxed">
            La forma más rápida si estás en Argentina: pago en ARS vía MercadoPago,
            sin registrarte ni dar vueltas. Con el valor de un café ya me estás bancando un montón.
          </p>
          <span className="flex items-center gap-1 text-xs text-[#E67E32]/60 font-mono group-hover:text-[#E67E32] transition-colors mt-auto">
            Invitame un cafecito <ExternalLink className="w-3 h-3" />
          </span>
        </a>

        {/* Matecito */}
        <a
          href={MATECITO_URL}
          target="_blank"
          rel="noreferrer"
          className="group border border-dashed border-line p-5 bg-[#0f0f0f] hover:bg-[#181818] hover:border-green-500/60 transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-500/60 group-hover:text-green-400 transition-colors" />
              <span className="font-bold text-primary group-hover:text-green-400 transition-colors">Matecito</span>
            </div>
            <span className="text-[10px] font-mono border border-green-500/40 text-green-400 bg-green-500/10 px-2 py-0.5">
              Otra opción local
            </span>
          </div>
          <p className="text-xs text-primary/50 leading-relaxed">
            Si preferís Matecito, acá estoy también. Mismo espíritu: colaboración directa,
            sin intermediarios raros, todo en pesos. Cada matecito cuenta igual de bien.
          </p>
          <span className="flex items-center gap-1 text-xs text-green-500/60 font-mono group-hover:text-green-400 transition-colors mt-auto">
            Convidarme un matecito <ExternalLink className="w-3 h-3" />
          </span>
        </a>

      </div>

      <p className="text-[10px] text-secondary font-mono border-t border-dashed border-line pt-4">
        // Gracias por leer. En serio.
      </p>
    </div>
  </BlueprintBox>
);

export const Blog = () => {
  const [query, setQuery] = useState('');
  const allPublished = useMemo(() => getAllPublished(), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return getRecentPosts(4);
    return allPublished.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query, allPublished]);

  return (
    <>
    <Helmet>
      <title>Blog & Notas — Artifex Dev</title>
      <meta name="description" content="Apuntes de estudio, exploraciones técnicas e implementaciones sobre React, TypeScript, desarrollo web y más. Blog de Ramiro Escobar." />
      <link rel="canonical" href="https://artifex.click/blog" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Blog & Notas — Artifex Dev" />
      <meta property="og:description" content="Apuntes de estudio, exploraciones técnicas e implementaciones sobre React, TypeScript, desarrollo web y más." />
      <meta property="og:url" content="https://artifex.click/blog" />
      <meta property="og:locale" content="es_AR" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Blog & Notas — Artifex Dev" />
      <meta name="twitter:description" content="Apuntes de estudio, exploraciones técnicas e implementaciones sobre React, TypeScript y desarrollo web." />
    </Helmet>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-12 md:bg-black/5 md:backdrop-blur-sm md:border md:border-white/[0.07] md:px-10 md:py-10">

        {/* Header */}
        <BlueprintBox coords={{ x: 5, y: 5 }} className="w-full">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-accent shrink-0 mt-1" />
            <div>
              <p className="text-secondary text-xs font-mono tracking-widest uppercase mb-1">// Knowledge_Base</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight">Blog & Notas</h1>
              <p className="text-primary/70 text-sm md:text-base leading-relaxed max-w-2xl">
                Apuntes de estudio, exploraciones técnicas e implementaciones que vale la pena documentar.
                Sin pretensiones -- ésto es un registro de lo que aprendo mientras lo aprendo.
              </p>
            </div>
          </div>
        </BlueprintBox>

        {/* Categorias */}
        <section>
          <p className="text-secondary text-xs font-mono mb-5">// CATEGORIAS ({categories.length})</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map(cat => {
              const count = countByCategory(cat.slug);
              const accentColorMap: Record<string, string> = {
                'text-blue-400':   'rgba(96, 165, 250, 0.35)',
                'text-accent':     'color-mix(in srgb, var(--color-accent) 35%, transparent)',
                'text-green-400':  'rgba(74, 222, 128, 0.35)',
                'text-purple-400': 'rgba(192, 132, 252, 0.35)',
                'text-yellow-400': 'rgba(250, 204, 21, 0.35)',
              };
              const decorationColor = accentColorMap[cat.accent.split(' ')[0]] ?? 'currentColor';
              return (
                <div key={cat.slug} className="relative group">
                  <Link
                    to={`/blog/${cat.slug}`}
                    className="inline-flex items-baseline gap-1.5 text-xs font-bold font-mono text-primary/70 hover:text-primary underline underline-offset-4 decoration-2 transition-colors"
                    style={{ textDecorationColor: decorationColor }}
                  >
                    {cat.title}
                    <span className="text-[10px] font-normal no-underline opacity-60">{count > 0 ? `${count}` : '—'}</span>
                  </Link>

                  {/* Tooltip */}
                  <div className="pointer-events-none absolute top-full left-0 z-50 mt-3 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
                    <div className="border border-dashed border-line bg-[#111111] p-4 flex flex-col gap-3">
                      <p className="text-[11px] text-primary/60 leading-relaxed font-normal">{cat.description}</p>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-accent/50">
                        Ver todos <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Buscador + Posts */}
        <section>
          {/* Search input */}
          <div className="flex items-center border border-dashed border-line bg-[#0f0f0f] px-3 mb-5 focus-within:border-accent/50 transition-colors">
            <Search className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar posts por título, tema o tag..."
              className="flex-1 bg-transparent text-sm text-primary placeholder:text-secondary/40 py-2.5 px-3 font-mono outline-none"
              aria-label="Buscar posts"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-secondary hover:text-primary transition-colors p-1"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Section label */}
          <p className="text-secondary text-xs font-mono mb-5">
            {query
              ? `// ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} para "${query}"`
              : '// PUBLICACIONES_RECIENTES'}
          </p>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filtered.map(post => {
                const cat = getCategoryBySlug(post.category);
                return (
                  <Link
                    key={post.slug}
                    to={`/blog/${post.category}/${post.slug}`}
                    className="group border border-dashed border-line p-5 bg-[#0f0f0f] hover:bg-[#181818] hover:border-accent transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      {cat && (
                        <span className={`text-[10px] font-mono border px-2 py-0.5 ${cat.accent}`}>
                          {cat.title}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-secondary font-mono">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {post.readTime} min
                      </span>
                      <span className="text-[10px] text-secondary font-mono">{post.date}</span>
                    </div>
                    <h3 className="text-primary font-bold mb-1 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-primary/60 leading-relaxed line-clamp-2">{post.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[10px] text-secondary font-mono">
                          <Tag className="w-2.5 h-2.5" aria-hidden="true" />{tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <BlueprintBox coords={{ x: 50, y: 70 }} className="w-full">
              <div className="text-center py-8">
                {query ? (
                  <>
                    <p className="text-secondary text-xs font-mono mb-2">// SIN_RESULTADOS</p>
                    <p className="text-primary/50 text-sm">
                      Ningún post coincide con <span className="text-accent font-mono">"{query}"</span>.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-secondary text-xs font-mono mb-3">// STATUS: INITIALIZING</p>
                    <p className="text-primary/50 text-sm max-w-md mx-auto leading-relaxed">
                      Las categorías estan listas. Las primeras publicaciones apareceran aqui cuando cambien a estado publicado en blog.ts.
                    </p>
                  </>
                )}
              </div>
            </BlueprintBox>
          )}
        </section>

        {/* Donaciones */}
        <DonationsSection />

      </div>
    </motion.div>
    </>
  );
};
