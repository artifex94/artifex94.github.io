import { useRef, useState } from 'react';
import { Bed, Bath, Maximize2, MapPin, Phone, Search } from 'lucide-react';
import { DemoBadge } from './DemoBadge';
import { DemoModal } from './_shared/DemoModal';
import { showToast, DemoToaster } from './_shared/toast';
import { usePageMeta } from '../hooks/usePageMeta';

const WA = "https://wa.me/5493436431987?text=Hola%2C%20consulto%20por%20una%20propiedad.";
const waFor = (mensaje: string) => `https://wa.me/5493436431987?text=${encodeURIComponent(mensaje)}`;

interface Propiedad {
  id: number;
  tipo: string;
  categoria: string;
  titulo: string;
  precio: string;
  zona: string;
  hab: number;
  banos: number;
  m2: number;
  img: string;
  tag: string;
}

const propiedades: Propiedad[] = [
  { id:1, tipo:'Venta', categoria:'Casa', titulo:'Casa familiar en Costanera', precio:'$85.000.000', zona:'Costanera, Victoria', hab:3, banos:2, m2:120, img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=80', tag:'Destacada' },
  { id:2, tipo:'Alquiler', categoria:'Departamento', titulo:'Departamento 2 ambientes centro', precio:'$180.000/mes', zona:'Centro, Victoria', hab:1, banos:1, m2:52, img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', tag:'' },
  { id:3, tipo:'Venta', categoria:'Lote', titulo:'Lote en barrio residencial', precio:'$45.000.000', zona:'Villa Itati, Victoria', hab:0, banos:0, m2:600, img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', tag:'Oportunidad' },
  { id:4, tipo:'Alquiler', categoria:'Casa', titulo:'PH amplio con jardín', precio:'$250.000/mes', zona:'Av. Sarmiento, Victoria', hab:3, banos:1, m2:90, img:'https://images.unsplash.com/photo-1762461838534-ca26dfa134a8?auto=format&fit=crop&w=400&q=80', tag:'' },
  { id:5, tipo:'Venta', categoria:'Casa', titulo:'Duplex a estrenar', precio:'$120.000.000', zona:'Barrio Nuevo, Victoria', hab:4, banos:2, m2:180, img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80', tag:'Nuevo' },
  { id:6, tipo:'Alquiler', categoria:'Local', titulo:'Local comercial sobre 25 de Mayo', precio:'$320.000/mes', zona:'Centro, Victoria', hab:0, banos:1, m2:75, img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', tag:'' },
];

const descripcionExtendida = (p: Propiedad) =>
  `${p.titulo}, ubicada en ${p.zona}. Propiedad en excelente estado de conservación, muy luminosa y de fácil acceso a comercios y transporte público. Ideal para quienes buscan calidad de vida en un entorno tranquilo de Victoria.`;

export const Inmobiliaria: React.FC = () => {
  usePageMeta({
    title: 'Victoria Propiedades — Demo Inmobiliaria | Artifex',
    description:
      'Sitio demo para inmobiliarias: catálogo de propiedades con búsqueda, filtros y contacto directo por WhatsApp.',
    canonicalPath: '/business/inmobiliarias',
    noindex: true,
  });
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [tipoProp, setTipoProp] = useState('Cualquier tipo');
  const [propSel, setPropSel] = useState<Propiedad | null>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  const lista = propiedades.filter(p => {
    const matchTipo = filtro === 'Todos' || p.tipo === filtro;
    const matchCategoria = tipoProp === 'Cualquier tipo' || p.categoria === tipoProp;
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q || p.titulo.toLowerCase().includes(q) || p.zona.toLowerCase().includes(q);
    return matchTipo && matchCategoria && matchBusqueda;
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#C9A84C] rounded flex items-center justify-center font-black text-[#1B2A4A] text-sm">VP</div>
          <span className="font-bold text-lg">Victoria <span className="text-[#C9A84C]">Propiedades</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm">
          <button onClick={() => setFiltro('Venta')} className="hover:text-[#C9A84C] transition-colors">Venta</button>
          <button onClick={() => setFiltro('Alquiler')} className="hover:text-[#C9A84C] transition-colors">Alquiler</button>
          <a href={WA} target="_blank" rel="noreferrer" className="hover:text-[#C9A84C] transition-colors">Tasaciones</a>
          <a href={WA} target="_blank" rel="noreferrer" className="hover:text-[#C9A84C] transition-colors">Contacto</a>
        </div>
        <a href={WA} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#C9A84C] text-[#1B2A4A] px-3 md:px-4 py-2 text-sm font-bold hover:bg-yellow-400 transition-colors">
          <Phone className="w-4 h-4" /> <span className="hidden sm:inline">Llamanos</span>
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
              <input
                className="w-full text-neutral-800 text-sm outline-none"
                placeholder="Zona, barrio o ciudad..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            <select
              className="text-neutral-700 text-sm outline-none px-2"
              value={filtro === 'Todos' ? 'Venta' : filtro}
              onChange={e => setFiltro(e.target.value)}
            >
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
            </select>
            <select
              className="text-neutral-700 text-sm outline-none px-2"
              value={tipoProp}
              onChange={e => setTipoProp(e.target.value)}
            >
              <option value="Cualquier tipo">Cualquier tipo</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Lote">Lote</option>
              <option value="Local">Local</option>
            </select>
            <button
              onClick={() => {
                resultadosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast(`${lista.length} propiedad${lista.length === 1 ? '' : 'es'} encontrada${lista.length === 1 ? '' : 's'}`);
              }}
              className="bg-[#C9A84C] text-[#1B2A4A] font-bold px-6 py-2 hover:bg-yellow-400 transition-colors text-sm"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div ref={resultadosRef} className="max-w-6xl mx-auto px-6 py-8">
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
            <div
              key={p.id}
              onClick={() => setPropSel(p)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPropSel(p); }
              }}
              className="border border-neutral-200 hover:shadow-lg transition-shadow group cursor-pointer"
            >
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
                <a href={waFor(`Hola, consulto por: ${p.titulo}`)} target="_blank" rel="noreferrer"
                  onClick={e => e.stopPropagation()}
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

      <DemoModal open={!!propSel} onClose={() => setPropSel(null)} title={propSel?.titulo ?? ''}>
        {propSel && (
          <div className="flex flex-col gap-4">
            <img src={propSel.img} alt={propSel.titulo} className="w-full h-56 object-cover rounded-lg" />
            <p className="text-neutral-300 text-sm leading-relaxed">{descripcionExtendida(propSel)}</p>
            <div className="grid grid-cols-2 gap-3 text-sm border-t border-white/10 pt-4">
              <div><span className="text-neutral-500">Precio</span><p className="font-bold text-white">{propSel.precio}</p></div>
              <div><span className="text-neutral-500">Zona</span><p className="font-bold text-white">{propSel.zona}</p></div>
              {propSel.hab > 0 && <div><span className="text-neutral-500">Ambientes</span><p className="font-bold text-white">{propSel.hab}</p></div>}
              {propSel.banos > 0 && <div><span className="text-neutral-500">Baños</span><p className="font-bold text-white">{propSel.banos}</p></div>}
              <div><span className="text-neutral-500">Superficie</span><p className="font-bold text-white">{propSel.m2} m²</p></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Visita solicitada, te contactamos');
                  setPropSel(null);
                }}
                className="flex-1 bg-white/10 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                Agendar visita
              </button>
              <a
                href={waFor(`Hola, consulto por: ${propSel.titulo}`)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center bg-[#C9A84C] text-[#1B2A4A] text-sm font-bold py-2.5 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        )}
      </DemoModal>

      <DemoToaster />
      <DemoBadge label="inmobiliaria" />
    </div>
  );
};
