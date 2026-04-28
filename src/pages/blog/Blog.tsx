import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Clock, Tag, Coffee, Heart, ExternalLink } from 'lucide-react';
import { BlueprintBox } from '../../components/BlueprintBox';
import { categories, getRecentPosts, countByCategory, getCategoryBySlug } from '../../data/blog';

const KOFI_URL = "https://ko-fi.com/artifexdev";
const CAFECITO_URL = "https://cafecito.app/artifexdev";

const DonationsSection = () => (
  <BlueprintBox coords={{ x: 80, y: 90 }} delay={0.4} className="w-full">
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-secondary text-xs font-mono mb-1">// SUPPORT_MODULE</p>
        <h2 className="text-xl font-bold text-primary mb-2">Apoya el proyecto</h2>
        <p className="text-sm text-primary/60 leading-relaxed max-w-2xl">
          Este blog no tiene publicidad. Todo el contenido es libre y sin paywalls.
          Si algo te fue util y queres colaborar con el tiempo que lleva, te dejo dos opciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Ko-fi */}
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noreferrer"
          className="group border border-dashed border-line p-5 bg-[#0f0f0f] hover:bg-[#181818] hover:border-accent transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors" />
              <span className="font-bold text-primary group-hover:text-accent transition-colors">Ko-fi</span>
            </div>
            <span className="text-[10px] font-mono border border-green-500/40 text-green-400 bg-green-500/10 px-2 py-0.5">
              0% comision
            </span>
          </div>
          <p className="text-xs text-primary/50 leading-relaxed">
            Pago unico en USD via Stripe o PayPal. Sin cuenta requerida.
            Ko-fi no cobra comision de plataforma -- solo las tasas estandar del procesador.
          </p>
          <span className="flex items-center gap-1 text-xs text-accent/60 font-mono group-hover:text-accent transition-colors mt-auto">
            Invitame un cafe <ExternalLink className="w-3 h-3" />
          </span>
        </a>

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
              Para Argentina
            </span>
          </div>
          <p className="text-xs text-primary/50 leading-relaxed">
            Pago en ARS via MercadoPago. La opcion local para quienes prefieren no operar en dolares.
            Comision del 5% de plataforma.
          </p>
          <span className="flex items-center gap-1 text-xs text-[#E67E32]/60 font-mono group-hover:text-[#E67E32] transition-colors mt-auto">
            Colaborar en pesos <ExternalLink className="w-3 h-3" />
          </span>
        </a>

      </div>

      <p className="text-[10px] text-secondary font-mono border-t border-dashed border-line pt-4">
        // NOTA: Actualiza las URLs en Blog.tsx con tus handles reales de Ko-fi y Cafecito antes de hacer deploy.
      </p>
    </div>
  </BlueprintBox>
);

export const Blog = () => {
  const recent = getRecentPosts(4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <BlueprintBox coords={{ x: 5, y: 5 }} className="w-full">
          <div className="flex items-start gap-4">
            <BookOpen className="w-8 h-8 text-accent shrink-0 mt-1" />
            <div>
              <p className="text-secondary text-xs font-mono tracking-widest uppercase mb-1">// Knowledge_Base</p>
              <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3 tracking-tight">Blog & Notas</h1>
              <p className="text-primary/70 text-sm md:text-base leading-relaxed max-w-2xl">
                Apuntes de estudio, exploraciones tecnicas e implementaciones que vale la pena documentar.
                Sin pretensiones -- esto es un registro de lo que aprendo mientras lo aprendo.
              </p>
            </div>
          </div>
        </BlueprintBox>

        {/* Categorias */}
        <section>
          <p className="text-secondary text-xs font-mono mb-5">// CATEGORIAS ({categories.length})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = countByCategory(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  to={`/blog/${cat.slug}`}
                  className="group border border-dashed border-line p-5 bg-[#111111] hover:bg-[#1a1a1a] hover:border-accent transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-primary font-bold group-hover:text-accent transition-colors">{cat.title}</h3>
                    <span className={`text-[10px] font-mono border px-2 py-0.5 ${cat.accent}`}>
                      {count > 0 ? `${count} posts` : 'proximamente'}
                    </span>
                  </div>
                  <p className="text-sm text-primary/60 leading-relaxed">{cat.description}</p>
                  <span className="flex items-center gap-1 text-xs text-accent/60 font-mono group-hover:text-accent transition-colors mt-auto">
                    Ver todos <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Posts recientes */}
        {recent.length > 0 && (
          <section>
            <p className="text-secondary text-xs font-mono mb-5">// PUBLICACIONES_RECIENTES</p>
            <div className="flex flex-col gap-4">
              {recent.map(post => {
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
                        <Clock className="w-3 h-3" /> {post.readTime} min
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
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {recent.length === 0 && (
          <BlueprintBox coords={{ x: 50, y: 70 }} className="w-full">
            <div className="text-center py-10">
              <p className="text-secondary text-xs font-mono mb-3">// STATUS: INITIALIZING</p>
              <p className="text-primary/50 text-sm max-w-md mx-auto leading-relaxed">
                Las categorias estan listas. Las primeras publicaciones apareceran aqui cuando cambien a estado publicado en blog.ts.
              </p>
            </div>
          </BlueprintBox>
        )}

        {/* Donaciones */}
        <DonationsSection />

      </div>
    </motion.div>
  );
};
