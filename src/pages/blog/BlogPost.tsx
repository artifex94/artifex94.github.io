import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Tag, Calendar } from 'lucide-react';
import { BlueprintBox } from '../../components/BlueprintBox';
import { getPostBySlug, getCategoryBySlug, type ContentBlock } from '../../data/blog';

function formatPostDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Renderer de bloques de contenido
const Block = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'h2':
      return <h2 className="text-xl font-bold text-primary mt-8 mb-3">{block.text}</h2>;
    case 'h3':
      return <h3 className="text-lg font-semibold text-primary mt-6 mb-2">{block.text}</h3>;
    case 'p':
      return <p className="text-[#c8c8c8] leading-relaxed mb-4">{block.text}</p>;
    case 'ul':
      return (
        <ul className="mb-4 flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#c8c8c8]">
              <span className="text-accent shrink-0 mt-0.5">--</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="mb-4 flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#c8c8c8]">
              <span className="text-accent font-mono shrink-0 w-5">{String(i + 1).padStart(2, '0')}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );
    case 'code':
      return (
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] border border-line px-3 py-1 border-b-0">
            <span className="text-[10px] font-mono text-secondary">{block.lang}</span>
          </div>
          <pre className="bg-[#111111] border border-line p-4 overflow-x-auto">
            <code className="text-sm font-mono text-accent/90 whitespace-pre">{block.text}</code>
          </pre>
        </div>
      );
    case 'callout':
      return (
        <div className="border-l-4 border-accent bg-accent/5 px-4 py-3 mb-4">
          <p className="text-sm text-[#dcdcdc] leading-relaxed">{block.text}</p>
        </div>
      );
    default:
      return null;
  }
};

export const BlogPost = () => {
  const { categorySlug, postSlug } = useParams<{ categorySlug: string; postSlug: string }>();
  const post = getPostBySlug(categorySlug ?? '', postSlug ?? '');
  const cat  = getCategoryBySlug(categorySlug ?? '');

  if (!post || !cat) return <Navigate to="/blog" replace />;

  const canonicalUrl   = `https://artifex.click/blog/${cat.slug}/${post.slug}`;
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Inicio',   'item': 'https://artifex.click/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Blog',     'item': 'https://artifex.click/blog' },
      { '@type': 'ListItem', 'position': 3, 'name': cat.title,  'item': `https://artifex.click/blog/${cat.slug}` },
      { '@type': 'ListItem', 'position': 4, 'name': post.title, 'item': canonicalUrl },
    ],
  };
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.summary,
    'datePublished': post.date,
    'url': canonicalUrl,
    'inLanguage': 'es-AR',
    'author': {
      '@type': 'Person',
      '@id': 'https://artifex.click/#person',
      'name': 'Ramiro Aníbal Escobar',
    },
    'publisher': {
      '@type': 'Person',
      '@id': 'https://artifex.click/#person',
    },
    'keywords': post.tags.join(', '),
  };

  return (
    <>
      <Helmet>
        <title>{post.title} — Artifex Blog</title>
        <meta name="description" content={post.summary} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${post.title} — Artifex Blog`} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="es_AR" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content="Ramiro Aníbal Escobar" />
        <meta property="article:tag" content={post.tags.join(', ')} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${post.title} — Artifex Blog`} />
        <meta name="twitter:description" content={post.summary} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-blueprint-grid py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link to="/blog" className="flex items-center gap-1 text-xs font-mono text-secondary hover:text-accent transition-colors">
            <ArrowLeft className="w-3 h-3" /> ./Blog
          </Link>
          <span className="text-secondary text-xs">/</span>
          <Link to={`/blog/${cat.slug}`} className={`text-xs font-mono hover:underline ${cat.accent.split(' ')[0]}`}>
            {cat.title}
          </Link>
          <span className="text-secondary text-xs">/</span>
          <span className="text-xs font-mono text-[#aaaaaa] truncate max-w-[200px]">{post.slug}</span>
        </div>

        {/* Header del post */}
        <BlueprintBox coords={{ x: 5, y: 5 }} className="w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-[10px] font-mono border px-2 py-0.5 ${cat.accent}`}>{cat.title}</span>
            <span className="flex items-center gap-1 text-[10px] text-secondary font-mono">
              <Clock className="w-3 h-3" /> {post.readTime} min de lectura
            </span>
            <span className="flex items-center gap-1 text-[10px] text-secondary font-mono">
              <Calendar className="w-3 h-3" /> {formatPostDate(post.date)}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4 leading-tight">{post.title}</h1>
          <p className="text-[#c0c0c0] leading-relaxed border-t border-dashed border-line pt-4 mt-2">
            {post.summary}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[10px] text-secondary font-mono">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>
        </BlueprintBox>

        {/* Contenido */}
        {post.content.length > 0 ? (
          <div className="border border-dashed border-line p-6 bg-[#0f0f0f]">
            {post.content.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        ) : (
          <BlueprintBox coords={{ x: 50, y: 50 }}>
            <div className="text-center py-10">
              <p className="text-secondary text-xs font-mono mb-2">// CONTENT_PENDING</p>
              <p className="text-[#787878] text-sm">Este post esta en progreso.</p>
            </div>
          </BlueprintBox>
        )}

        {/* Navegacion */}
        <div className="flex gap-4 pt-4 border-t border-dashed border-line">
          <Link
            to={`/blog/${cat.slug}`}
            className="flex items-center gap-2 text-xs font-mono text-secondary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Volver a {cat.title}
          </Link>
        </div>

      </div>
    </motion.div>
    </>
  );
};
