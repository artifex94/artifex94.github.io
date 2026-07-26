import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageCircle, RefreshCw, ShoppingBag } from 'lucide-react';
import '@fontsource-variable/fraunces/index.css';
import { puffyCardClass, puffyInteractiveClass, WoolPlaceholder, WoolStitch } from '../components/tufting/PuffySurface';
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      data-theme="tufting"
      className="min-h-screen w-full bg-tufting-warm py-12 px-4 sm:px-6 lg:px-8 text-primary"
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <header className="text-center">
          <Link
            to="/servicios/tufting"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Volver a Tufting
          </Link>
          <span className="text-accent uppercase tracking-widest text-xs font-bold mb-3 block">
            Piezas disponibles
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4 leading-tight">
            Obras listas para <span className="text-accent italic">llevar</span>
          </h1>
          <p className="text-secondary leading-relaxed max-w-2xl mx-auto">
            Piezas únicas ya tejidas, suaves y terminadas. Cuando una se va, no se repite igual:
            cada textura queda con su pequeña historia de taller.
          </p>
          <WoolStitch className="mx-auto mt-7 max-w-sm" />
        </header>

        {notice && (
          <p role="status" className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
            {notice}
          </p>
        )}
        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface px-4 py-2 font-bold text-primary"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {loading ? (
          <div className={cn(puffyCardClass, 'flex min-h-[18rem] items-center justify-center p-10 text-center')}>
            <div className="flex flex-col items-center gap-3 text-secondary">
              <Loader2 size={28} className="animate-spin text-accent" aria-hidden="true" />
              Cargando piezas disponibles…
            </div>
          </div>
        ) : products.length === 0 ? (
          <section className={cn(puffyCardClass, 'p-8 text-center md:p-12')}>
            <ShoppingBag size={36} className="mx-auto mb-4 text-accent" aria-hidden="true" />
            <h2 className="font-display text-2xl font-semibold mb-3">
              Muy pronto voy a subir piezas disponibles
            </h2>
            <p className="text-secondary leading-relaxed max-w-xl mx-auto mb-7">
              Mientras tanto, podés encargar la tuya en el bastidor y ver el presupuesto al toque.
            </p>
            <Link
              to="/servicios/tufting/calculadora"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-7 py-3 font-bold text-on-accent transition-opacity hover:opacity-90"
            >
              Encargar la mía
            </Link>
          </section>
        ) : (
          <section aria-label="Piezas disponibles" className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, index) => {
              const isBusy = busyProductId === product.id;
              const stillVisible = byId.has(product.id);
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className={cn(puffyCardClass, puffyInteractiveClass, 'flex flex-col p-3')}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={`Pieza de tufting: ${product.name}`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full rounded-[1.6rem] object-cover"
                    />
                  ) : (
                    <WoolPlaceholder label="Foto muy pronto" className="rounded-[1.6rem]" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
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
                        'mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-bold text-on-accent transition-opacity',
                        isBusy ? 'cursor-wait opacity-70' : 'hover:opacity-90',
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
