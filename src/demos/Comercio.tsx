import React, { useState } from 'react';
import { ShoppingBag, MapPin, Clock, Search, Heart, Share2, Phone, Tag, Truck } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

const WA_BASE = "https://wa.me/5493436431987?text=Hola%2C%20consulto%20por%20";

const categorias = ['Todo', 'Ropa', 'Calzado', 'Accesorios', 'Ofertas'];

const productos = [
  { cat:'Ropa', nombre:'Vestido floral verano', precio:'$22.500', precioOld:'$28.000', img:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&q=80', tallas:['S','M','L','XL'], colores:['Rosa','Blanco'], badge:'', oferta:false },
  { cat:'Ropa', nombre:'Jean mom fit', precio:'$31.000', precioOld:'', img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80', tallas:['36','38','40','42'], colores:['Azul','Negro'], badge:'Nuevo', oferta:false },
  { cat:'Calzado', nombre:'Zapatillas urbanas', precio:'$45.000', precioOld:'$55.000', img:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', tallas:['36','37','38','39','40'], colores:['Blanco','Negro'], badge:'', oferta:true },
  { cat:'Calzado', nombre:'Sandalias planas', precio:'$18.500', precioOld:'', img:'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80', tallas:['36','37','38','39'], colores:['Beige','Negro'], badge:'', oferta:false },
  { cat:'Accesorios', nombre:'Cartera de cuero', precio:'$28.000', precioOld:'$35.000', img:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', tallas:[], colores:['Marrón','Negro','Camel'], badge:'Destacado', oferta:true },
  { cat:'Accesorios', nombre:'Cinturón trenzado', precio:'$9.500', precioOld:'', img:'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80', tallas:['S/M','L/XL'], colores:['Marrón','Negro'], badge:'', oferta:false },
  { cat:'Ofertas', nombre:'Remera básica pack x3', precio:'$15.000', precioOld:'$24.000', img:'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=400&q=80', tallas:['S','M','L'], colores:['Blanco','Negro','Gris'], badge:'-37%', oferta:true },
  { cat:'Ofertas', nombre:'Short deportivo', precio:'$12.000', precioOld:'$16.500', img:'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80', tallas:['S','M','L','XL'], colores:['Negro','Azul'], badge:'-27%', oferta:true },
];

export const Comercio: React.FC = () => {
  const [cat, setCat] = useState('Todo');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState<number[]>([]);

  const lista = productos.filter(p => {
    const matchCat = cat === 'Todo' || p.cat === cat || (cat === 'Ofertas' && p.oferta);
    const matchSearch = search === '' || p.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleLike = (i: number) => setLiked(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#E91E8C]" />
          <span className="font-extrabold text-xl tracking-tight text-neutral-900">moda<span className="text-[#E91E8C]">VIC</span></span>
        </div>
        <div className="hidden md:flex flex-1 max-w-sm mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-full outline-none focus:border-[#E91E8C] transition-colors"
            placeholder="Buscar productos..." />
        </div>
        <a href={`${WA_BASE}un%20producto.`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#E91E8C] text-white px-4 py-2 text-sm font-bold rounded-full hover:bg-pink-600 transition-colors">
          <Phone className="w-4 h-4" /> Consultar
        </a>
      </nav>

      {/* Banner hero */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80" alt="tienda" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E91E8C]/70 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white">
          <span className="text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Victoria, Entre Ríos</span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Moda para<br />cada momento.</h1>
          <p className="mt-2 text-white/70 text-sm">Hacé tu pedido por WhatsApp · Envíos a domicilio en Victoria</p>
        </div>
      </div>

      {/* Badges info */}
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap gap-3">
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm rounded-full"><Truck className="w-4 h-4 text-[#E91E8C]" /> Envíos en Victoria</span>
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm rounded-full"><Tag className="w-4 h-4 text-[#E91E8C]" /> Nuevos ingresos semanales</span>
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm rounded-full"><MapPin className="w-4 h-4 text-[#E91E8C]" /> Local en Centro Victoria</span>
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-xs font-semibold shadow-sm rounded-full"><Clock className="w-4 h-4 text-[#E91E8C]" /> Lun–Sab 9:00–20:00</span>
      </div>

      {/* Catálogo */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-extrabold text-neutral-900">Catálogo</h2>
          <div className="flex gap-2 flex-wrap">
            {categorias.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-1.5 text-sm font-bold rounded-full border transition-all ${cat===c ? 'bg-[#E91E8C] text-white border-[#E91E8C]' : 'border-neutral-200 text-neutral-600 bg-white hover:border-[#E91E8C]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-full outline-none"
            placeholder="Buscar productos..." />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {lista.map((p, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative overflow-hidden h-48">
                <img src={p.img} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {p.badge && <span className="absolute top-2 left-2 bg-[#E91E8C] text-white text-xs font-bold px-2 py-0.5 rounded">{p.badge}</span>}
                <button onClick={() => toggleLike(i)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className={`w-4 h-4 ${liked.includes(i) ? 'fill-[#E91E8C] text-[#E91E8C]' : 'text-neutral-400'}`} />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-neutral-900 text-sm mb-1 leading-tight">{p.nombre}</h3>
                {p.tallas.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-2">
                    {p.tallas.map(t => <span key={t} className="text-xs border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-500">{t}</span>)}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-extrabold text-neutral-900">{p.precio}</span>
                  {p.precioOld && <span className="text-xs text-neutral-400 line-through">{p.precioOld}</span>}
                </div>
                <div className="flex gap-2">
                  <a href={`${WA_BASE}${encodeURIComponent(p.nombre)}.`} target="_blank" rel="noreferrer"
                    className="flex-1 text-center text-xs bg-[#E91E8C] text-white py-2 font-bold rounded hover:bg-pink-600 transition-colors">
                    Comprar
                  </a>
                  <a href={`${WA_BASE}${encodeURIComponent(p.nombre)}.`} target="_blank" rel="noreferrer"
                    className="w-8 flex items-center justify-center border border-neutral-200 rounded hover:border-[#E91E8C] transition-colors">
                    <Share2 className="w-3 h-3 text-neutral-400" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {lista.length === 0 && (
          <div className="text-center py-20 text-neutral-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No se encontraron productos.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#E91E8C] text-white py-12 px-6 text-center">
        <h3 className="text-2xl font-extrabold mb-2">¿No encontraste lo que buscabas?</h3>
        <p className="text-white/70 mb-6">Escribinos y te ayudamos a encontrar tu talle o color favorito.</p>
        <a href={`${WA_BASE}un%20producto%20en%20particular.`} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2 bg-white text-[#E91E8C] px-8 py-3 font-bold rounded-full hover:bg-pink-50 transition-colors">
          <Phone className="w-4 h-4" /> Escribirnos por WhatsApp
        </a>
      </div>

      <DemoBadge label="comercios" />
    </div>
  );
};
