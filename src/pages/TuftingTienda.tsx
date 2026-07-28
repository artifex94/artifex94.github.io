import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import '@fontsource-variable/fraunces/index.css';
import '@fontsource/baloo-2/700.css';
import '@fontsource/baloo-2/800.css';
import { WoolPlaceholder } from '../components/tufting/PuffySurface';
import { AtelierFeltPanel, AtelierIconBadge, AtelierWoodFrame } from '../components/tufting/Atelier';
import {
  atelierFeltPanelClass,
  atelierInteractiveClass,
  atelierPillClass,
  atelierPrimaryTagClass,
  clothBackground,
} from '../components/tufting/atelierMaterials';
import { FileteadoCardRule, FileteadoCorner, FileteadoDivider } from '../components/tufting/Fileteado';
import { WHATSAPP_NUMBER } from '../data/contact';
import { breadcrumb } from '../data/structuredData';
import {
  createStoreCheckout,
  listTuftingProducts,
  StoreCheckoutError,
  type TuftingProduct,
} from '../data/tuftingStore';
import { usePageMeta } from '../hooks/usePageMeta';
import { cn } from '../utils/cn';

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const buildProductWhatsAppUrl = (productName: string): string | null => {
  if (!WHATSAPP_NUMBER) return null;
  const message = `Hola! Me interesa la pieza ${productName}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const TuftingTienda: React.FC = () => {
  const [products, setProducts] = useState<TuftingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  usePageMeta({
    title: 'Tienda de piezas de tufting disponibles | Artifex',
    description:
      'Piezas únicas de tufting disponibles para comprar: alfombras y tapices artesanales listos para entregar desde Victoria, Entre Ríos.',
    canonicalPath: '/servicios/tufting/tienda',
    jsonLd: breadcrumb([
      { name: 'Inicio', path: '/' },
      { name: 'Tufting', path: '/servicios/tufting' },
      { name: 'Tienda', path: '/servicios/tufting/tienda' },
    ]),
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextProducts = await listTuftingProducts();
      setProducts(nextProducts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pude cargar las piezas disponibles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

  const buy = async (product: TuftingProduct) => {
    setBusyProductId(product.id);
    setNotice(null);
    setError(null);
    try {
      const checkout = await createStoreCheckout({ productId: product.id });
      window.location.href = checkout.initPoint;
    } catch (cause) {
      if (cause instanceof StoreCheckoutError && cause.code === 'mp_unavailable') {
        const whatsappUrl = buildProductWhatsAppUrl(product.name);
        if (whatsappUrl) {
          window.location.href = whatsappUrl;
          return;
        }
        setError('MercadoPago no está disponible ahora. Escribime por WhatsApp o probá de nuevo más tarde.');
      } else if (cause instanceof StoreCheckoutError && cause.code === 'no_disponible') {
        setNotice('Esa pieza ya no está disponible. Actualicé la tienda para mostrarte lo que queda.');
        await loadProducts();
      } else {
        setError(cause instanceof Error ? cause.message : 'No pude preparar la compra.');
      }
    } finally {
      setBusyProductId(null);
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full overflow-x-hidden bg-atelier-cloth py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <header className="relative text-center">
          <AtelierWoodFrame className="mx-auto max-w-3xl rounded-[2.6rem] p-2.5 sm:p-3.5">
            <div className={cn(atelierFeltPanelClass, 'px-5 py-8 sm:px-10 md:py-10')}>
              <div className="relative z-10">
                <Link
                  to="/servicios/tufting"
                  className={cn(atelierPillClass, 'mb-6 min-h-0 px-4 py-2 text-secondary')}
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Volver a Tufting
                </Link>
                <span className="text-accent uppercase tracking-widest text-xs font-bold mb-3 block">
                  Piezas disponibles
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-tight">
                  Piezas que esperan <span className="text-accent italic">su casa</span>
                </h1>
                <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
                  Piezas únicas, ya tejidas, suaves y terminadas. Ninguna se repite: cuando una encuentra
                  dueño, esa historia se cierra y en el bastidor empieza otra.
                </p>
                <FileteadoDivider className="mx-auto mt-7 max-w-sm" />
              </div>
            </div>
          </AtelierWoodFrame>
        </header>

        {notice && (
          <p role="status" className={cn(atelierFeltPanelClass, 'px-5 py-4 text-sm font-semibold text-accent')}>
            {notice}
          </p>
        )}
        {error && (
          <div role="alert" className={cn(atelierFeltPanelClass, 'flex flex-col gap-3 px-5 py-4 text-sm text-accent sm:flex-row sm:items-center sm:justify-between')}>
            <span>{error}</span>
            <button
              type="button"
              onClick={loadProducts}
              className={cn(atelierPillClass, 'min-h-0 px-4 py-2')}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <AtelierFeltPanel framed className="flex min-h-[18rem] items-center justify-center p-10 text-center">
            <div className="flex flex-col items-center gap-3 text-secondary">
              <Loader2 size={28} className="animate-spin text-accent" aria-hidden="true" />
              Buscando piezas en el estante…
            </div>
          </AtelierFeltPanel>
        ) : products.length === 0 ? (
          <AtelierFeltPanel framed className="p-8 text-center md:p-12">
            <AtelierIconBadge className="mx-auto mb-4">
              <ShoppingBag size={28} aria-hidden="true" />
            </AtelierIconBadge>
            <h2 className="font-display text-2xl font-semibold mb-3">
              Por ahora, el estante está vacío
            </h2>
            <p className="text-secondary leading-relaxed max-w-xl mx-auto mb-7">
              Las próximas piezas todavía están en el bastidor, tomando forma. Mientras tanto, podés
              encargar la tuya y ver el presupuesto al toque.
            </p>
            <Link
              to="/servicios/tufting/calculadora"
              className={atelierPrimaryTagClass}
            >
              Encargar la mía
            </Link>
          </AtelierFeltPanel>
        ) : (
          <section aria-label="Piezas disponibles" className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => {
              const isBusy = busyProductId === product.id;
              const stillVisible = byId.has(product.id);
              return (
                <motion.article
                  key={product.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: index * 0.06 }}
                  className={cn(atelierFeltPanelClass, atelierInteractiveClass, 'flex flex-col p-3')}
                >
                  <FileteadoCorner className="pointer-events-none absolute -right-5 -top-5 z-10 h-16 w-16 opacity-35" flip="x" />
                  <AtelierWoodFrame className="rounded-[1.75rem] p-2">
                    <div className="relative overflow-hidden rounded-[1.25rem]" style={clothBackground}>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={`Pieza de tufting: ${product.name}`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-square w-full rounded-[1.05rem] object-cover"
                        />
                      ) : (
                        <WoolPlaceholder label="Foto muy pronto" className="atelier-felt aspect-square rounded-[1.05rem] border-0" />
                      )}
                      <div aria-hidden="true" className="pointer-events-none absolute inset-2 rounded-[0.9rem] border border-dashed border-[color:rgba(253,249,243,0.72)] shadow-[inset_0_0_0_1px_rgba(43,35,32,0.08)]" />
                    </div>
                  </AtelierWoodFrame>
                  <div className="flex flex-1 flex-col p-5">
                    <FileteadoCardRule className="mb-2 max-w-36 opacity-55" />
                    <h2 className="font-display text-xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-sm text-secondary leading-relaxed flex-1">{product.description}</p>
                    <p className="mt-5 font-display text-2xl font-semibold text-accent">
                      {ars.format(product.priceArs)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void buy(product)}
                      disabled={isBusy || !stillVisible}
                      className={cn(
                        atelierPrimaryTagClass,
                        'mt-5',
                        isBusy ? 'cursor-wait opacity-70' : '',
                      )}
                    >
                      {isBusy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <MessageCircle size={18} aria-hidden="true" />}
                      Comprar
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </motion.div>
  );
};
