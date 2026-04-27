import { useState } from 'react';
import { ShoppingCart, MapPin, Clock, Star, Phone, Flame, Leaf, Award } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

const WA_ORDER = "https://wa.me/5493436431987?text=Hola%2C%20quisiera%20hacer%20un%20pedido.";
const WA_RESERVA = "https://wa.me/5493436431987?text=Hola%2C%20quisiera%20hacer%20una%20reserva.";

const categorias = ['Todo', 'Entradas', 'Principales', 'Pastas', 'Postres', 'Bebidas'];

const menu = [
  { cat:'Entradas', nombre:'Tabla de fiambres', desc:'Selección de quesos, salamín y aceitunas artesanales.', precio:'$6.500', img:'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&q=80', badge:'🔥 Popular' },
  { cat:'Entradas', nombre:'Empanadas (x6)', desc:'Carne cortada a cuchillo o caprese. Horno de barro.', precio:'$5.800', img:'https://images.unsplash.com/photo-1604467794349-0b74285de7e7?w=400&q=80', badge:'' },
  { cat:'Principales', nombre:'Asado a la parrilla', desc:'Costillar de novillo con chimichurri casero y ensalada.', precio:'$18.500', img:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', badge:'⭐ Estrella' },
  { cat:'Principales', nombre:'Milanesa napolitana', desc:'Milanesa de ternera con salsa, jamón y mozzarella.', precio:'$12.000', img:'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&q=80', badge:'' },
  { cat:'Pastas', nombre:'Ravioles de ricotta', desc:'Con salsa fileto o a la crema. Masa fresca casera.', precio:'$10.500', img:'https://images.unsplash.com/photo-1608756687911-aa1599ab3bd9?w=400&q=80', badge:'🌿 Casero' },
  { cat:'Pastas', nombre:'Sorrentinos de jamón', desc:'Rellenos de jamón y queso con salsa rosa.', precio:'$11.000', img:'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=80', badge:'' },
  { cat:'Postres', nombre:'Panqueques con dulce de leche', desc:'Con crema batida y nueces.', precio:'$4.500', img:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80', badge:'' },
  { cat:'Postres', nombre:'Flan casero', desc:'Con crema y dulce de leche artesanal.', precio:'$3.800', img:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80', badge:'💛 Clásico' },
  { cat:'Bebidas', nombre:'Vino Malbec (copa)', desc:'Selección de bodegas de Mendoza.', precio:'$3.500', img:'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80', badge:'' },
  { cat:'Bebidas', nombre:'Limonada natural', desc:'Con jengibre y menta. Sin conservantes.', precio:'$2.800', img:'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80', badge:'🌿' },
];

export const Gastronomia: React.FC = () => {
  const [cat, setCat] = useState('Todo');

  const lista = cat === 'Todo' ? menu : menu.filter(m => m.cat === cat);

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans">
      {/* Navbar */}
      <nav className="bg-[#2C1810] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4A843] flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#2C1810]" />
          </div>
          <span className="font-bold text-lg">La <span className="text-[#D4A843]">Ribera</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-white/70">
          <a href="#menu" className="hover:text-[#D4A843] transition-colors">Menú</a>
          <a href={WA_RESERVA} target="_blank" rel="noreferrer" className="hover:text-[#D4A843] transition-colors">Reservas</a>
          <a href="#info" className="hover:text-[#D4A843] transition-colors">Nosotros</a>
        </div>
        <a href={WA_ORDER} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#D4A843] text-[#2C1810] px-4 py-2 text-sm font-bold rounded hover:bg-yellow-300 transition-colors">
          <ShoppingCart className="w-4 h-4" /> Pedir ahora
        </a>
      </nav>

      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80" alt="restaurante" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810] via-[#2C1810]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <span className="flex items-center gap-1 text-sm text-white/70"><MapPin className="w-3 h-3" /> Victoria, Entre Ríos</span>
              <span className="flex items-center gap-1 text-sm text-white/70"><Clock className="w-3 h-3" /> 12:00 – 15:00 · 20:00 – 23:30</span>
              <span className="flex items-center gap-1 text-sm text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" /> 4.8 (142 reseñas)</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold">La Ribera — <span className="text-[#D4A843]">Cocina de Victoria</span></h1>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap gap-3">
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm rounded"><Leaf className="w-4 h-4 text-green-500" /> Ingredientes locales</span>
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm rounded"><Flame className="w-4 h-4 text-orange-500" /> Horno de barro</span>
        <span className="flex items-center gap-2 bg-white border border-neutral-200 px-4 py-2 text-sm font-medium shadow-sm rounded"><Award className="w-4 h-4 text-[#D4A843]" /> 10 años en Victoria</span>
      </div>

      {/* Menú */}
      <div id="menu" className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-extrabold text-[#2C1810] mb-6">Nuestra carta</h2>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categorias.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 text-sm font-bold border transition-all ${cat===c ? 'bg-[#2C1810] text-white border-[#2C1810]' : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#2C1810]'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lista.map((item, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex hover:shadow-md transition-shadow group">
              <div className="w-28 flex-shrink-0 overflow-hidden">
                <img src={item.img} alt={item.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-bold text-[#2C1810]">{item.nombre}</h3>
                    {item.badge && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">{item.badge}</span>}
                  </div>
                  <p className="text-xs text-neutral-500">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-extrabold text-[#2C1810] text-lg">{item.precio}</span>
                  <a href={`https://wa.me/5493436431987?text=Hola%2C%20quiero%20pedir%20${encodeURIComponent(item.nombre)}.`}
                    target="_blank" rel="noreferrer"
                    className="text-xs bg-[#2C1810] text-white px-3 py-1.5 font-bold rounded hover:bg-[#D4A843] hover:text-[#2C1810] transition-colors">
                    Pedir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Pedido */}
      <div className="bg-[#2C1810] text-white py-12 px-6 text-center mt-8">
        <h3 className="text-2xl font-extrabold mb-3">¿Querés pedir o reservar mesa?</h3>
        <p className="text-white/60 mb-6">Pedidos para llevar, delivery zona centro de Victoria y reservas por WhatsApp.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={WA_ORDER} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-[#D4A843] text-[#2C1810] px-8 py-3 font-bold rounded hover:bg-yellow-300 transition-colors">
            <ShoppingCart className="w-4 h-4" /> Hacer pedido
          </a>
          <a href={WA_RESERVA} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 border border-[#D4A843] text-[#D4A843] px-8 py-3 font-bold rounded hover:bg-[#D4A843] hover:text-[#2C1810] transition-colors">
            <Phone className="w-4 h-4" /> Reservar mesa
          </a>
        </div>
      </div>

      {/* Info */}
      <div id="info" className="max-w-5xl mx-auto px-6 py-10 flex flex-wrap gap-8 text-sm text-neutral-600">
        <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-[#D4A843] mt-0.5 flex-shrink-0" /><div><p className="font-bold text-neutral-800">Dirección</p><p>Costanera Ibicuy 120, Victoria, Entre Ríos</p></div></div>
        <div className="flex items-start gap-2"><Clock className="w-4 h-4 text-[#D4A843] mt-0.5 flex-shrink-0" /><div><p className="font-bold text-neutral-800">Horarios</p><p>Lun–Dom 12:00–15:00 · Jue–Dom 20:00–23:30</p></div></div>
        <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-[#D4A843] mt-0.5 flex-shrink-0" /><div><p className="font-bold text-neutral-800">Contacto</p><a href={WA_ORDER} className="text-[#D4A843] hover:underline">WhatsApp / Pedidos</a></div></div>
      </div>

      <DemoBadge label="gastronomia" />
    </div>
  );
};
