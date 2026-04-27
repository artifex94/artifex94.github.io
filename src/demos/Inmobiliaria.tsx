import React, { useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, Phone, Search } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

const WA = "https://wa.me/5493436431987?text=Hola%2C%20consulto%20por%20una%20propiedad.";

const propiedades = [
  { id:1, tipo:'Venta', titulo:'Casa familiar en Costanera', precio:'$85.000.000', zona:'Costanera, Victoria', hab:3, banos:2, m2:120, img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80', tag:'Destacada' },
  { id:2, tipo:'Alquiler', titulo:'Departamento 2 ambientes centro', precio:'$180.000/mes', zona:'Centro, Victoria', hab:1, banos:1, m2:52, img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', tag:'' },
  { id:3, tipo:'Venta', titulo:'Lote en barrio residencial', precio:'$45.000.000', zona:'Villa Itati, Victoria', hab:0, banos:0, m2:600, img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', tag:'Oportunidad' },
  { id:4, tipo:'Alquiler', titulo:'PH amplio con jardín', precio:'$250.000/mes', zona:'Av. Sarmiento, Victoria', hab:3, banos:1, m2:90, img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', tag:'' },
  { id:5, tipo:'Venta', titulo:'Duplex a estrenar', precio:'$120.000.000', zona:'Barrio Nuevo, Victoria', hab:4, banos:2, m2:180, img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', tag:'Nuevo' },
  { id:6, tipo:'Alquiler', titulo:'Local comercial sobre 25 de Mayo', precio:'$320.000/mes', zona:'Centro, Victoria', hab:0, banos:1, m2:75, img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', tag:'' },
];

export const Inmobiliaria: React.FC = () => {
  const [filtro, setFiltro] = useState('Todos');

  const lista = filtro === 'Todos' ? propiedades : propiedades.filter(p => p.tipo === filtro);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C9A84C] rounded flex items-center justify-center font-black text-[#1B2A4A] text-sm">VP</div>
          <span className="font-bold text-lg">Victoria <span className="text-[#C9A84C]">Propiedades</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm">
          <a href="#" className="hover:text-[#C9A84C] transition-colors">Venta</a>
          <a href="#" className="hover:text-[#C9A84C] transition-colors">Alquiler</a>
          <a href="#" className="hover:text-[#C9A84C] transition-colors">Tasaciones</a>
          <a href="#" className="hover:text-[#C9A84C] transition-colors">Contacto</a>
        </div>
        <a href={WA} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 bg-[#C9A84C] text-[#1B2A4A] px-4 py-2 text-sm font-bold hover:bg-yellow-400 transition-colors">
          <Phone className="w-4 h-4" /> Llamanos
        </a>
      </nav>

      {/* Hero */}
      <div className="relative bg-[#1B2A4A] text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url(https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=60)', backgroundSize:'cover', backgroundPosition:'center'}}></div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Encontrá tu <span className="text-[#C9A84C]">próximo hogar</span></h1>
          <p className="text-white/70 mb-8 text-lg">Más de 200 propiedades en Victoria y Entre Ríos</p>
          <div className="bg-white rounded shadow-xl p-4 flex flex-col md:flex-row gap-3 text-left">
            <div className="flex-1 flex items-center gap-2 border-b md:border-b-0 md:border-r border-neutral-200 pb-3 md:pb-0 md:pr-4">
              <Search className="w-4 h-4 text-neutral-400" />
              <input className="w-full text-neutral-800 text-sm outline-none" placeholder="Zona, barrio o ciudad..." />
            </div>
            <select className="text-neutral-700 text-sm outline-none px-2">
              <option>Venta</option><option>Alquiler</option>
            </select>
            <select className="text-neutral-700 text-sm outline-none px-2">
              <option>Cualquier tipo</option><option>Casa</option><option>Departamento</option><option>Lote</option><option>Local</option>
            </select>
            <button className="bg-[#C9A84C] text-[#1B2A4A] font-bold px-6 py-2 hover:bg-yellow-400 transition-colors text-sm">Buscar</button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-2xl font-bold text-[#1B2A4A]">Propiedades disponibles</h2>
          <div className="flex gap-2">
            {['Todos','Venta','Alquiler'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-4 py-1.5 text-sm font-semibold border transition-colors ${filtro===f ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]' : 'border-neutral-300 text-neutral-600 hover:border-[#1B2A4A]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lista.map(p => (
            <div key={p.id} className="border border-neutral-200 hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative overflow-hidden h-48">
                <img src={p.img} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-[#1B2A4A] text-white text-xs px-2 py-1 font-bold">{p.tipo}</span>
                {p.tag && <span className="absolute top-3 right-3 bg-[#C9A84C] text-[#1B2A4A] text-xs px-2 py-1 font-bold">{p.tag}</span>}
              </div>
              <div className="p-4">
                <p className="text-2xl font-extrabold text-[#1B2A4A] mb-1">{p.precio}</p>
                <h3 className="font-semibold text-neutral-800 mb-2">{p.titulo}</h3>
                <div className="flex items-center gap-1 text-neutral-500 text-xs mb-3">
                  <MapPin className="w-3 h-3" /> {p.zona}
                </div>
                {p.m2 > 0 && (
                  <div className="flex gap-4 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
                    {p.hab > 0 && <span className="flex items-center gap-1"><Bed className="w-3 h-3"/>{p.hab} amb.</span>}
                    {p.banos > 0 && <span className="flex items-center gap-1"><Bath className="w-3 h-3"/>{p.banos} baños</span>}
                    <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3"/>{p.m2} m²</span>
                  </div>
                )}
                <a href={WA} target="_blank" rel="noreferrer"
                  className="mt-4 block text-center bg-[#1B2A4A] text-white text-sm py-2 font-semibold hover:bg-[#C9A84C] hover:text-[#1B2A4A] transition-colors">
                  Consultar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1B2A4A] text-white/60 text-center py-8 text-sm mt-12">
        Victoria Propiedades — Victoria, Entre Ríos · <a href={WA} className="text-[#C9A84C] hover:underline">Contacto WhatsApp</a>
      </footer>

      <DemoBadge label="inmobiliaria" />
    </div>
  );
};
