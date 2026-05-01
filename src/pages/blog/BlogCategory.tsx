import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Tag, FileText } from 'lucide-react';
import { BlueprintBox } from '../../components/BlueprintBox';
import { categories, posts, getCategoryBySlug } from '../../data/blog';

export const BlogCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const cat = getCategoryBySlug(categorySlug ?? '');

  if (!cat) return <Navigate to="/blog" replace />;

  const catPosts = posts
    .filter(p => p.category === cat.slug)
    .sort((a, b) => b.date.localeCompare(a.date));

  const published = catPosts.filter(p => p.status === 'published');
  const drafts    = catPosts.filter(p => p.status === 'draft');

  const canonicalUrl = `https://artifex.click/blog/${cat.slug}`;

  return (
    <>
      <Helmet>
        <title>{cat.title} — Artifex Blog</title>
        <meta name="description" content={cat.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${cat.title} — Artifex Blog`} />
        <meta property="og:description" content={cat.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="es_AR" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${cat.title} — Artifex Blog`} />
        <meta name="twitter:description" content={cat.description} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': 'https://artifex.click/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Blog',   'item': 'https://artifex.click/blog' },
            { '@type': 'ListItem', 'position': 3, 'name': cat.title, 'item': canonicalUrl },
          ],
        })}</script>
      </Helmet>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto flex flex-col gap-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link to="/blog" className="flex items-center gap-1 text-xs font-mono text-secondary hover:text-accent transition-colors">
            <ArrowLeft className="w-3 h-3" /> ./Blog
          </Link>
          <span className="text-secondary text-xs">/</span>
          <span className={`text-xs font-mono ${cat.accent.split(' ')[0]}`}>{cat.title}</span>
        </div>

        {/* Header categoria */}
        <BlueprintBox coords={{ x: 5, y: 5 }} className="w-full">
          <p className={`text-xs font-mono tracking-widest uppercase mb-2 ${cat.accent.split(' ')[0]}`}>
            // {cat.slug.toUpperCase()}
          </p>
          <h1 className="text-3xl font-bold text-primary mb-3">{cat.title}</h1>
          <p className="text-primary/70 text-sm leading-relaxed max-w-2xl">{cat.description}</p>
          <div className="flex gap-4 mt-4 pt-4 border-t border-dashed border-line">
            <span className="text-xs text-secondary font-mono">{published.length} publicados</span>
            <span className="text-xs text-secondary font-mono">{drafts.length} en progreso</span>
          </div>
        </BlueprintBox>

        {/* Posts publicados */}
        {published.length > 0 && (
          <section>
            <p className="text-secondary text-xs font-mono mb-5">// PUBLICADOS</p>
            <div className="flex flex-col gap-4">
              {published.map(post => (
                <Link
                  key={post.slug}
                  to={`/blog/${cat.slug}/${post.slug}`}
                  className="group border border-dashed border-line p-5 bg-[#0f0f0f] hover:bg-[#181818] hover:border-accent transition-all"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-[10px] text-secondary font-mono">
                      <Clock className="w-3 h-3" /> {post.readTime} min
                    </span>
                    <span className="text-[10px] text-secondary font-mono">{post.date}</span>
                  </div>
                  <h3 className="text-primary font-bold mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-primary/60 leading-relaxed line-clamp-2">{post.summary}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[10px] text-secondary font-mono">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Posts en progreso */}
        {drafts.length > 0 && (
          <section>
            <p className="text-secondary text-xs font-mono mb-5">// EN_PROGRESO</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drafts.map(post => (
                <div
                  key={post.slug}
                  className="border border-dashed border-line/40 p-5 bg-[#0d0d0d] opacity-60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-[10px] font-mono text-secondary border border-line px-1.5 py-0.5">draft</span>
                  </div>
                  <h4 className="text-primary/80 font-medium text-sm leading-snug mb-1">{post.title}</h4>
                  <p className="text-xs text-primary/40 line-clamp-2">{post.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {catPosts.length === 0 && (
          <BlueprintBox coords={{ x: 50, y: 60 }}>
            <div className="text-center py-8">
              <p className="text-secondary text-xs font-mono mb-2">// NO_CONTENT_YET</p>
              <p className="text-primary/40 text-sm">Proximamente.</p>
            </div>
          </BlueprintBox>
        )}

        {/* Otras categorias */}
        <section>
          <p className="text-secondary text-xs font-mono mb-4">// OTRAS_CATEGORIAS</p>
          <div className="flex flex-wrap gap-3">
            {categories.filter(c => c.slug !== cat.slug).map(c => (
              <Link
                key={c.slug}
                to={`/blog/${c.slug}`}
                className={`text-xs font-mono border px-3 py-1.5 bg-[#111111] hover:bg-[#1a1a1a] transition-colors ${c.accent}`}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
    </>
  );
};
