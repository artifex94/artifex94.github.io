import { useState, type ReactElement } from 'react';
import {
  BarChart2, Users, TrendingUp, Bell, Settings, Home,
  FileText, ChevronRight, Plus, MessageCircle,
  AlertCircle, CheckCircle2, Package, Layers,
  Phone, Search, Download, Eye, Share2, FolderOpen,
  Filter, Calendar, DollarSign, UserCheck, Clock,
} from 'lucide-react';
import { DemoBadge } from './DemoBadge';
import { DemoModal } from './_shared/DemoModal';
import { showToast, DemoToaster } from './_shared/toast';
import { usePageMeta } from '../hooks/usePageMeta';

const WA = "https://wa.me/5493436431987?text=Hola%2C%20me%20interesa%20un%20sistema%20de%20gesti%C3%B3n%20para%20mi%20empresa.";

// ── Datos ──────────────────────────────────────────────────────────────────

const kpis = [
  { label: "Obras activas",     value: "12",    delta: "+2 este mes",       Icon: Package,    color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"    },
  { label: "Clientes",          value: "47",    delta: "+5 este trimestre", Icon: Users,      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Facturación",       value: "$4.2M", delta: "+18% vs mes ant.",  Icon: TrendingUp, color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100"  },
  { label: "Tareas pendientes", value: "8",     delta: "3 urgentes",        Icon: AlertCircle,color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
];

const actividadReciente = [
  { tipo: "ok",   msg: "Obra OBR-038 alcanzó el 90 % de avance",        hora: "Hace 2h"  },
  { tipo: "warn", msg: "3 tareas de OBR-033 sin asignar",                hora: "Hace 5h"  },
  { tipo: "ok",   msg: "Factura #2041 cobrada — Retail Corp.",           hora: "Ayer"     },
  { tipo: "warn", msg: "Vencimiento de garantía en OBR-031 en 7 días",   hora: "Ayer"     },
];

const todasObras = [
  { id: "OBR-041", nombre: "Edificio Rivadavia II",      cliente: "Desarrollo Litoral SA", responsable: "Ing. Martínez", estado: "En progreso", avance: 65,  presupuesto: "$2.400.000", inicio: "Ago 2024", entrega: "Mar 2025", prioridad: "Alta"  },
  { id: "OBR-040", nombre: "Vivienda Familiar Sosa",     cliente: "Roberto Sosa",          responsable: "Ing. Pérez",    estado: "Planificada", avance: 0,   presupuesto: "$850.000",   inicio: "May 2025", entrega: "Nov 2025", prioridad: "Media" },
  { id: "OBR-038", nombre: "Casa Familia Gómez",         cliente: "Juan Gómez",            responsable: "Ing. Martínez", estado: "En progreso", avance: 90,  presupuesto: "$1.100.000", inicio: "Jun 2024", entrega: "Ene 2025", prioridad: "Alta"  },
  { id: "OBR-035", nombre: "Local Comercial Norte",      cliente: "Retail Corp.",          responsable: "Ing. López",    estado: "Entregada",   avance: 100, presupuesto: "$680.000",   inicio: "Jul 2024", entrega: "Dic 2024", prioridad: "—"     },
  { id: "OBR-033", nombre: "Depósito Industrial Agro",   cliente: "Agro SA",               responsable: "Ing. Pérez",    estado: "En progreso", avance: 40,  presupuesto: "$1.950.000", inicio: "Nov 2024", entrega: "Abr 2025", prioridad: "Media" },
  { id: "OBR-030", nombre: "Remodelación Oficinas BD",   cliente: "Banco del Litoral",     responsable: "Ing. López",    estado: "Entregada",   avance: 100, presupuesto: "$420.000",   inicio: "Ago 2024", entrega: "Nov 2024", prioridad: "—"     },
];

const clientes = [
  { id: "CLI-012", nombre: "Desarrollo Litoral SA", tipo: "Empresa",    obras: 3, contacto: "Luis Fernández",  tel: "+54 343 412-3456", ultimoContacto: "Hoy",          estado: "Activo"   },
  { id: "CLI-009", nombre: "Juan Gómez",            tipo: "Particular", obras: 1, contacto: "Juan Gómez",     tel: "+54 343 487-2341", ultimoContacto: "Hace 3 días",  estado: "Activo"   },
  { id: "CLI-007", nombre: "Retail Corp.",           tipo: "Empresa",    obras: 2, contacto: "Ana Ruiz",       tel: "+54 11 5234-7890", ultimoContacto: "Hace 2 sem.",  estado: "Inactivo" },
  { id: "CLI-005", nombre: "Agro SA",                tipo: "Pyme",       obras: 1, contacto: "Gustavo Méndez", tel: "+54 343 456-7890", ultimoContacto: "Ayer",         estado: "Activo"   },
  { id: "CLI-003", nombre: "Banco del Litoral",      tipo: "Empresa",    obras: 1, contacto: "María Castro",   tel: "+54 343 490-1234", ultimoContacto: "Hace 1 mes",   estado: "Inactivo" },
];

const facturacion = [
  { mes: "Oct", valor: 620  },
  { mes: "Nov", valor: 890  },
  { mes: "Dic", valor: 450  },
  { mes: "Ene", valor: 1100 },
  { mes: "Feb", valor: 780  },
  { mes: "Mar", valor: 1340 },
  { mes: "Abr", valor: 960  },
];
const maxFact = 1340;

const resumenInformes = [
  { label: "Facturado YTD",    value: "$4.2M",  sub: "vs $3.5M año anterior", color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Cobrado YTD",      value: "$3.8M",  sub: "90.5% de efectividad",  color: "text-emerald-600",bg: "bg-emerald-50"},
  { label: "Obras entregadas", value: "8",      sub: "en los últimos 12 meses",color: "text-blue-600",   bg: "bg-blue-50"   },
  { label: "Ticket promedio",  value: "$525k",  sub: "por obra en 2025",       color: "text-amber-600",  bg: "bg-amber-50"  },
];

const carpetas = [
  { nombre: "OBR-041 — Edificio Rivadavia II",  archivos: 12, size: "48 MB"  },
  { nombre: "OBR-038 — Casa Gómez",             archivos: 7,  size: "18 MB"  },
  { nombre: "OBR-033 — Depósito Industrial",    archivos: 5,  size: "12 MB"  },
  { nombre: "Contratos y Legales",              archivos: 23, size: "94 MB"  },
  { nombre: "Certificados y Habilitaciones",    archivos: 9,  size: "31 MB"  },
];

const archivosRecientes = [
  { nombre: "Plano_Planta_Alta_Rev3.pdf",        tipo: "PDF", obra: "OBR-041", size: "4.2 MB", fecha: "Hoy"        },
  { nombre: "Presupuesto_Final_Aprobado.xlsx",   tipo: "XLS", obra: "OBR-038", size: "0.8 MB", fecha: "Ayer"       },
  { nombre: "Contrato_AgroSA_2025.pdf",          tipo: "PDF", obra: "OBR-033", size: "1.1 MB", fecha: "Hace 3 días"},
  { nombre: "Foto_Avance_Semana12.jpg",          tipo: "IMG", obra: "OBR-041", size: "3.5 MB", fecha: "Hace 5 días"},
  { nombre: "Memoria_Calculo_Estructura.pdf",    tipo: "PDF", obra: "OBR-038", size: "8.7 MB", fecha: "Hace 1 sem."},
];

const notificaciones = [
  { tipo: "ok",   msg: "Obra OBR-041 actualizó su cronograma",              hora: "Hace 10 min" },
  { tipo: "info", msg: "Nuevo mensaje de Retail Corp. sobre OBR-035",       hora: "Hace 1 h"    },
  { tipo: "warn", msg: "Factura #2043 vence en 3 días",                    hora: "Hace 4 h"    },
  { tipo: "ok",   msg: "Agro SA confirmó reunión de obra para el jueves",  hora: "Ayer"         },
];

// Contenido ficticio de cada carpeta: reutiliza archivos reales de la obra
// cuando el nombre de la carpeta coincide, y completa con genéricos.
const archivosGenericos = ['Índice_General.pdf', 'Notas_Internas.docx', 'Checklist_Revision.xlsx', 'Respaldo_Legal.pdf', 'Anexo_Tecnico.pdf'];
const contenidoCarpeta = (carpeta: { nombre: string; archivos: number }) => {
  const match = carpeta.nombre.match(/^(OBR-\d+)/);
  const reales = match ? archivosRecientes.filter(f => f.obra === match[1]).map(f => f.nombre) : [];
  const relleno = archivosGenericos.slice(0, Math.max(0, Math.min(carpeta.archivos, 5) - reales.length));
  return [...reales, ...relleno];
};

// ── Nav items ───────────────────────────────────────────────────────────────

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',   Icon: Home      },
  { id: 'obras',      label: 'Obras',       Icon: Package   },
  { id: 'clientes',   label: 'Clientes',    Icon: Users     },
  { id: 'informes',   label: 'Informes',    Icon: BarChart2 },
  { id: 'documentos', label: 'Documentos',  Icon: FileText  },
];

const sectionMeta: Record<string, { label: string; sub: string }> = {
  dashboard:  { label: 'Dashboard',  sub: 'Panel principal'          },
  obras:      { label: 'Obras',      sub: 'Gestión de proyectos'     },
  clientes:   { label: 'Clientes',   sub: 'Base de clientes'         },
  informes:   { label: 'Informes',   sub: 'Análisis y facturación'   },
  documentos: { label: 'Documentos', sub: 'Archivos y documentación' },
};

// ── Tipos derivados de los datos ficticios ─────────────────────────────────

type Obra = typeof todasObras[number];
type Cliente = typeof clientes[number];
type Carpeta = typeof carpetas[number];
type Archivo = typeof archivosRecientes[number];

// ── Helpers visuales ────────────────────────────────────────────────────────

const EstadoBadge = ({ estado }: { estado: string }) => {
  const map: Record<string, string> = {
    'En progreso': 'bg-blue-100 text-blue-700',
    'Entregada':   'bg-emerald-100 text-emerald-700',
    'Planificada': 'bg-gray-100 text-gray-500',
  };
  const icon: Record<string, ReactElement> = {
    'En progreso': <AlertCircle className="w-3 h-3" />,
    'Entregada':   <CheckCircle2 className="w-3 h-3" />,
    'Planificada': <Clock className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 ${map[estado] ?? 'bg-gray-100 text-gray-500'}`}>
      {icon[estado]} {estado}
    </span>
  );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
  const map: Record<string, string> = {
    Empresa:    'bg-violet-100 text-violet-700',
    Particular: 'bg-sky-100 text-sky-700',
    Pyme:       'bg-amber-100 text-amber-700',
  };
  return <span className={`text-[11px] font-bold px-2 py-0.5 ${map[tipo] ?? 'bg-gray-100 text-gray-500'}`}>{tipo}</span>;
};

const FileTypeBadge = ({ tipo }: { tipo: string }) => {
  const map: Record<string, string> = {
    PDF: 'bg-red-100 text-red-600',
    XLS: 'bg-emerald-100 text-emerald-600',
    IMG: 'bg-blue-100 text-blue-600',
  };
  return <span className={`text-[10px] font-black px-1.5 py-0.5 ${map[tipo] ?? 'bg-gray-100 text-gray-500'}`}>{tipo}</span>;
};

// ── Contenido de modales ─────────────────────────────────────────────────────

const ObraDetalle = ({ obra }: { obra: Obra }) => (
  <div className="flex flex-col gap-4 text-sm text-neutral-200">
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs text-neutral-500">{obra.id}</span>
      <EstadoBadge estado={obra.estado} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Cliente</p><p className="font-medium text-white">{obra.cliente}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Responsable</p><p className="font-medium text-white">{obra.responsable}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Presupuesto</p><p className="font-medium text-white">{obra.presupuesto}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Prioridad</p><p className="font-medium text-white">{obra.prioridad === '—' ? 'Sin prioridad' : obra.prioridad}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Inicio</p><p className="font-medium text-white">{obra.inicio}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Entrega</p><p className="font-medium text-white">{obra.entrega}</p></div>
    </div>
    <div>
      <div className="flex justify-between text-xs text-neutral-400 mb-1">
        <span>Avance de obra</span><span className="tabular-nums">{obra.avance}%</span>
      </div>
      <div className="w-full bg-white/10 h-2">
        <div className={`h-full ${obra.avance === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${obra.avance}%` }} />
      </div>
    </div>
  </div>
);

const ClienteDetalle = ({ cliente }: { cliente: Cliente }) => {
  const obrasCliente = todasObras.filter(o => o.cliente === cliente.nombre);
  const historial = [
    { hito: "Primer contacto",              hora: "Hace varios meses" },
    { hito: "Presupuesto aprobado",         hora: "Hace 2 meses"      },
    { hito: "Último contacto registrado",   hora: cliente.ultimoContacto },
  ];
  return (
    <div className="flex flex-col gap-4 text-sm text-neutral-200">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-neutral-500">{cliente.id}</span>
        <TipoBadge tipo={cliente.tipo} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Contacto</p><p className="font-medium text-white">{cliente.contacto}</p></div>
        <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Teléfono</p><p className="font-medium text-white">{cliente.tel}</p></div>
        <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Estado</p><p className="font-medium text-white">{cliente.estado}</p></div>
        <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Último contacto</p><p className="font-medium text-white">{cliente.ultimoContacto}</p></div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">Obras asociadas</p>
        {obrasCliente.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {obrasCliente.map(o => (
              <li key={o.id} className="flex items-center justify-between gap-2 bg-white/5 px-3 py-2">
                <span className="text-xs text-neutral-200">{o.nombre}</span>
                <EstadoBadge estado={o.estado} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-neutral-500">Sin obras registradas.</p>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-neutral-500 mb-2">Historial</p>
        <ul className="flex flex-col gap-2">
          {historial.map((h, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-neutral-300">
              <Clock className="w-3 h-3 text-neutral-500 shrink-0" /> {h.hito}
              <span className="text-neutral-500 ml-auto">{h.hora}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ArchivoPreview = ({ archivo }: { archivo: Archivo }) => (
  <div className="flex flex-col gap-4 text-sm text-neutral-200">
    <div className="flex items-center justify-center bg-white/5 border border-white/10 h-40">
      <div className="flex flex-col items-center gap-2 text-neutral-500">
        <FileText className="w-10 h-10" />
        <span className="text-xs">Vista previa no disponible en la demo</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Tipo</p><FileTypeBadge tipo={archivo.tipo} /></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Obra</p><p className="font-medium text-white font-mono text-xs">{archivo.obra}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Tamaño</p><p className="font-medium text-white">{archivo.size}</p></div>
      <div><p className="text-[11px] uppercase tracking-wide text-neutral-500">Última modificación</p><p className="font-medium text-white">{archivo.fecha}</p></div>
    </div>
  </div>
);

const CarpetaDetalle = ({ carpeta }: { carpeta: Carpeta }) => {
  const archivos = contenidoCarpeta(carpeta);
  return (
    <div className="flex flex-col gap-3 text-sm text-neutral-200">
      <p className="text-xs text-neutral-400">{carpeta.archivos} archivos · {carpeta.size}</p>
      <ul className="flex flex-col gap-1.5">
        {archivos.map((nombre, i) => (
          <li key={i} className="flex items-center gap-2 bg-white/5 px-3 py-2 text-xs text-neutral-200">
            <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" /> {nombre}
          </li>
        ))}
      </ul>
      {carpeta.archivos > archivos.length && (
        <p className="text-[11px] text-neutral-500">+ {carpeta.archivos - archivos.length} archivos más</p>
      )}
    </div>
  );
};

const inputClass = "w-full bg-white/5 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 transition-colors placeholder:text-neutral-500";
const labelClass = "block text-xs text-neutral-400 mb-1";
const submitClass = "mt-1 w-full bg-blue-600 text-white text-sm font-bold py-2.5 hover:bg-blue-700 transition-colors";

const FormNuevaObra = () => (
  <div className="flex flex-col gap-3">
    <div><label className={labelClass}>Nombre de la obra</label><input className={inputClass} placeholder="Ej: Edificio Belgrano III" /></div>
    <div><label className={labelClass}>Cliente</label><input className={inputClass} placeholder="Ej: Desarrollo Litoral SA" /></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelClass}>Presupuesto</label><input className={inputClass} placeholder="$0" /></div>
      <div><label className={labelClass}>Fecha de inicio</label><input type="date" className={inputClass} /></div>
    </div>
  </div>
);

const FormNuevoCliente = () => (
  <div className="flex flex-col gap-3">
    <div><label className={labelClass}>Nombre o razón social</label><input className={inputClass} placeholder="Ej: Constructora Nueva SA" /></div>
    <div className="grid grid-cols-2 gap-3">
      <div><label className={labelClass}>Tipo</label><input className={inputClass} placeholder="Empresa / Particular / Pyme" /></div>
      <div><label className={labelClass}>Teléfono</label><input className={inputClass} placeholder="+54 343 000-0000" /></div>
    </div>
    <div><label className={labelClass}>Contacto principal</label><input className={inputClass} placeholder="Nombre del contacto" /></div>
  </div>
);

const FormSubirArchivo = () => (
  <div className="flex flex-col gap-3">
    <div><label className={labelClass}>Archivo</label><input type="file" className={`${inputClass} file:mr-3 file:border-0 file:bg-blue-600 file:text-white file:px-3 file:py-1.5 file:text-xs file:font-bold`} /></div>
    <div><label className={labelClass}>Obra asociada</label><input className={inputClass} placeholder="Ej: OBR-041" /></div>
  </div>
);

const FormConfiguracion = () => (
  <div className="flex flex-col gap-3">
    {[
      { label: "Notificaciones por email", checked: true  },
      { label: "Autenticación en dos pasos", checked: false },
      { label: "Recordatorios de vencimiento", checked: true  },
    ].map((opt, i) => (
      <label key={i} className="flex items-center justify-between gap-3 bg-white/5 px-3 py-2.5 text-sm text-neutral-200">
        {opt.label}
        <input type="checkbox" defaultChecked={opt.checked} disabled className="w-4 h-4 accent-blue-600 opacity-60" />
      </label>
    ))}
    <p className="text-[11px] text-neutral-500">Ajustes ilustrativos — no editables en esta demo.</p>
  </div>
);

// ── Vistas ──────────────────────────────────────────────────────────────────

const kpiNavTarget: Record<string, string> = {
  "Obras activas": 'obras',
  "Clientes": 'clientes',
  "Facturación": 'informes',
};

const ViewDashboard = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [obraSel, setObraSel] = useState<Obra | null>(null);
  const [showNuevaObra, setShowNuevaObra] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, delta, Icon, color, bg, border }, i) => {
          const target = kpiNavTarget[label];
          return (
            <div
              key={i}
              onClick={target ? () => onNavigate(target) : undefined}
              className={`bg-white border ${border} p-4 ${target ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold leading-tight">{label}</p>
                <span className={`p-1.5 ${bg} shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></span>
              </div>
              <p className="text-2xl font-black text-gray-800 mb-1">{value}</p>
              <p className="text-xs text-gray-400">{delta}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Obras recientes</h2>
            <button
              onClick={() => setShowNuevaObra(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Nueva obra
            </button>
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID','Obra','Estado','Avance'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {todasObras.slice(0, 4).map((o, i) => (
                  <tr key={i} onClick={() => setObraSel(o)} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group cursor-pointer">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-sm">{o.nombre}</p>
                      <p className="text-xs text-gray-400">{o.cliente}</p>
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={o.estado} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-20">
                        <div className="flex-1 bg-gray-100 h-1.5">
                          <div className={`h-full ${o.avance === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${o.avance}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums">{o.avance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="md:hidden divide-y divide-gray-50">
            {todasObras.slice(0, 4).map((o, i) => (
              <li key={i} onClick={() => setObraSel(o)} className="px-4 py-3.5 flex flex-col gap-2.5 cursor-pointer active:bg-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-mono">{o.id}</span>
                  <EstadoBadge estado={o.estado} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{o.nombre}</p>
                  <p className="text-xs text-gray-400">{o.cliente}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 h-1.5">
                    <div className={`h-full ${o.avance === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${o.avance}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums">{o.avance}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Actividad reciente</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {actividadReciente.map((a, i) => (
              <li key={i} className="px-5 py-3.5 flex items-start gap-3">
                <span className={`mt-1 shrink-0 w-2 h-2 rounded-full ${a.tipo === 'ok' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">{a.msg}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.hora}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 border-t border-gray-50">
            <a href={WA} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white text-xs font-bold py-2.5 hover:bg-[#1ebe5d] transition-colors">
              <MessageCircle className="w-4 h-4" /> Contactar soporte
            </a>
          </div>
        </div>
      </div>

      <DemoModal open={obraSel !== null} onClose={() => setObraSel(null)} title={obraSel?.nombre ?? ''}>
        {obraSel && <ObraDetalle obra={obraSel} />}
      </DemoModal>
      <DemoModal open={showNuevaObra} onClose={() => setShowNuevaObra(false)} title="Nueva obra">
        <FormNuevaObra />
        <button
          onClick={() => { setShowNuevaObra(false); showToast('Obra creada'); }}
          className={submitClass}>
          Crear obra
        </button>
      </DemoModal>
    </div>
  );
};

const ViewObras = () => {
  const [filtro, setFiltro] = useState('Todos');
  const [obraSel, setObraSel] = useState<Obra | null>(null);
  const [showNuevaObra, setShowNuevaObra] = useState(false);
  const filtros = ['Todos', 'En progreso', 'Planificada', 'Entregada'];
  const lista = filtro === 'Todos' ? todasObras : todasObras.filter(o => o.estado === filtro);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {filtros.map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                filtro === f ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-400'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowNuevaObra(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nueva obra
        </button>
      </div>

      {/* Tabla ampliada */}
      <div className="bg-white border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm min-w-175">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['ID','Nombre & Cliente','Responsable','Estado','Avance','Presupuesto','Entrega','Prioridad',''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((o, i) => (
              <tr key={i} onClick={() => setObraSel(o)} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group cursor-pointer">
                <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{o.nombre}</p>
                  <p className="text-xs text-gray-400">{o.cliente}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{o.responsable}</td>
                <td className="px-4 py-3 whitespace-nowrap"><EstadoBadge estado={o.estado} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-20">
                    <div className="flex-1 bg-gray-100 h-1.5">
                      <div className={`h-full ${o.avance === 100 ? 'bg-emerald-500' : o.avance === 0 ? 'bg-gray-200' : 'bg-blue-500'}`}
                        style={{ width: `${o.avance}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums">{o.avance}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">{o.presupuesto}</td>
                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{o.entrega}</span>
                </td>
                <td className="px-4 py-3">
                  {o.prioridad !== '—' && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 ${
                      o.prioridad === 'Alta' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>{o.prioridad}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <ul className="md:hidden divide-y divide-gray-50">
          {lista.map((o, i) => (
            <li key={i} onClick={() => setObraSel(o)} className="p-4 flex flex-col gap-3 cursor-pointer active:bg-gray-50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-400 font-mono">{o.id}</span>
                {o.prioridad !== '—' && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 ${
                    o.prioridad === 'Alta' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                  }`}>{o.prioridad}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm leading-tight">{o.nombre}</p>
                <p className="text-xs text-gray-400">{o.cliente}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 h-1.5">
                  <div className={`h-full ${o.avance === 100 ? 'bg-emerald-500' : o.avance === 0 ? 'bg-gray-200' : 'bg-blue-500'}`}
                    style={{ width: `${o.avance}%` }} />
                </div>
                <span className="text-xs text-gray-400 tabular-nums">{o.avance}%</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5">
                <EstadoBadge estado={o.estado} />
                <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{o.entrega}</span>
                <span className="text-xs font-semibold text-gray-700">{o.presupuesto}</span>
                <span className="text-xs text-gray-400">{o.responsable}</span>
              </div>
            </li>
          ))}
        </ul>
        {lista.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No hay obras en este estado.</div>
        )}
      </div>

      <DemoModal open={obraSel !== null} onClose={() => setObraSel(null)} title={obraSel?.nombre ?? ''}>
        {obraSel && <ObraDetalle obra={obraSel} />}
      </DemoModal>
      <DemoModal open={showNuevaObra} onClose={() => setShowNuevaObra(false)} title="Nueva obra">
        <FormNuevaObra />
        <button
          onClick={() => { setShowNuevaObra(false); showToast('Obra creada'); }}
          className={submitClass}>
          Crear obra
        </button>
      </DemoModal>
    </div>
  );
};

const ViewClientes = () => {
  const [busqueda, setBusqueda] = useState('');
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [showNuevoCliente, setShowNuevoCliente] = useState(false);
  const lista = clientes.filter(c =>
    !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.contacto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowNuevoCliente(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nuevo cliente
        </button>
      </div>

      {/* Cards de stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total clientes', value: '47', Icon: Users,    color: 'text-blue-600',    bg: 'bg-blue-50'    },
          { label: 'Activos',        value: '31', Icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Sin actividad',  value: '16', Icon: Clock,    color: 'text-amber-600',   bg: 'bg-amber-50'   },
        ].map(({ label, value, Icon, color, bg }, i) => (
          <div key={i} className="bg-white border border-gray-100 p-4 flex items-center gap-3">
            <span className={`p-2 ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></span>
            <div>
              <p className="text-xl font-black text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla clientes */}
      <div className="bg-white border border-gray-100">
        <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm min-w-150">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Cliente','Tipo','Obras','Contacto','Último contacto','Estado',''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map((c, i) => (
              <tr key={i} onClick={() => setClienteSel(c)} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group cursor-pointer">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-800">{c.nombre}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.id}</p>
                </td>
                <td className="px-4 py-3"><TipoBadge tipo={c.tipo} /></td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-semibold">
                    <Package className="w-3 h-3 text-gray-400" /> {c.obras}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-700">{c.contacto}</p>
                  <p className="text-[11px] text-gray-400">{c.tel}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.ultimoContacto}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 ${
                    c.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                  }`}>{c.estado}</span>
                </td>
                <td className="px-4 py-3">
                  <a href={WA} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                    className="p-1.5 text-gray-300 hover:text-[#25D366] transition-colors block">
                    <Phone className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <ul className="md:hidden divide-y divide-gray-50">
          {lista.map((c, i) => (
            <li key={i} onClick={() => setClienteSel(c)} className="p-4 flex flex-col gap-2.5 cursor-pointer active:bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{c.nombre}</p>
                  <p className="text-[11px] text-gray-400 font-mono">{c.id}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 ${
                  c.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                }`}>{c.estado}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <TipoBadge tipo={c.tipo} />
                <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-semibold">
                  <Package className="w-3 h-3 text-gray-400" /> {c.obras} obras
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 pt-0.5">
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 truncate">{c.contacto}</p>
                  <p className="text-[11px] text-gray-400">{c.tel}</p>
                </div>
                <a href={WA} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-3 py-2 shrink-0 hover:bg-[#1ebe5d] transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Llamar
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <DemoModal open={clienteSel !== null} onClose={() => setClienteSel(null)} title={clienteSel?.nombre ?? ''}>
        {clienteSel && <ClienteDetalle cliente={clienteSel} />}
      </DemoModal>
      <DemoModal open={showNuevoCliente} onClose={() => setShowNuevoCliente(false)} title="Nuevo cliente">
        <FormNuevoCliente />
        <button
          onClick={() => { setShowNuevoCliente(false); showToast('Cliente agregado'); }}
          className={submitClass}>
          Agregar cliente
        </button>
      </DemoModal>
    </div>
  );
};

const ViewInformes = () => (
  <div className="flex flex-col gap-5">
    {/* KPI resumen */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {resumenInformes.map(({ label, value, sub, color }, i) => (
        <div key={i} className="bg-white border border-gray-100 p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-3">{label}</p>
          <p className={`text-2xl font-black mb-1 ${color}`}>{value}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Gráfico de facturación */}
      <div className="lg:col-span-2 bg-white border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">Facturación mensual</h2>
            <p className="text-xs text-gray-400">Últimos 7 meses — en miles de ARS</p>
          </div>
          <button
            onClick={() => showToast('Período: 2024–2025')}
            className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 px-2.5 py-1 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Filter className="w-3 h-3" /> 2024–2025
          </button>
        </div>

        {/* Barras */}
        <div className="flex items-end gap-3 h-36 px-2">
          {facturacion.map((m, i) => {
            const pct = (m.valor / maxFact) * 100;
            const isMax = m.valor === maxFact;
            return (
              <div
                key={i}
                onClick={() => showToast(`${m.mes}: $${m.valor}k facturados`)}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer group/bar">
                <span className={`text-[10px] font-bold tabular-nums ${isMax ? 'text-blue-600' : 'text-gray-400'}`}>
                  ${m.valor}k
                </span>
                <div className="w-full flex items-end" style={{ height: '96px' }}>
                  <div
                    className={`w-full transition-all duration-500 ${isMax ? 'bg-blue-600' : 'bg-blue-300'} group-hover/bar:bg-blue-500`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{m.mes}</span>
              </div>
            );
          })}
        </div>

        {/* Línea total */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Crecimiento promedio mensual: <strong className="text-emerald-600 ml-1">+8.3%</strong>
          </div>
          <span className="text-xs text-gray-400">Total período: <strong className="text-gray-700">$6.14M</strong></span>
        </div>
      </div>

      {/* Distribución por tipo de obra */}
      <div className="bg-white border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 text-sm mb-1">Facturación por tipo</h2>
        <p className="text-xs text-gray-400 mb-5">Distribución 2024–2025</p>
        <div className="flex flex-col gap-4">
          {[
            { label: 'Residencial',  pct: 42, color: 'bg-blue-500'   },
            { label: 'Comercial',    pct: 28, color: 'bg-violet-500' },
            { label: 'Industrial',   pct: 20, color: 'bg-amber-400'  },
            { label: 'Remodelación', pct: 10, color: 'bg-emerald-400'},
          ].map(({ label, pct, color }, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">{label}</span>
                <span className="tabular-nums text-gray-400">{pct}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2">
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <DollarSign className="w-4 h-4 text-violet-500" />
            Mejor mes: <strong className="text-violet-600 ml-1">Marzo 2025 ($1.34M)</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ViewDocumentos = () => {
  const [busquedaDocs, setBusquedaDocs] = useState('');
  const [carpetaSel, setCarpetaSel] = useState<Carpeta | null>(null);
  const [archivoSel, setArchivoSel] = useState<Archivo | null>(null);
  const [showSubirArchivo, setShowSubirArchivo] = useState(false);

  const q = busquedaDocs.toLowerCase();
  const carpetasFiltradas = carpetas.filter(c => !q || c.nombre.toLowerCase().includes(q));
  const archivosFiltrados = archivosRecientes.filter(f =>
    !q || f.nombre.toLowerCase().includes(q) || f.obra.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 w-64">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
            placeholder="Buscar archivo..."
            value={busquedaDocs}
            onChange={e => setBusquedaDocs(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowSubirArchivo(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Subir archivo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Carpetas */}
        <div className="bg-white border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4">Carpetas de proyecto</h2>
          <ul className="flex flex-col gap-1">
            {carpetasFiltradas.map((c, i) => (
              <li key={i}>
                <button
                  onClick={() => setCarpetaSel(c)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50 group transition-colors rounded-sm">
                  <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">{c.nombre}</p>
                    <p className="text-[11px] text-gray-400">{c.archivos} archivos · {c.size}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0" />
                </button>
              </li>
            ))}
            {carpetasFiltradas.length === 0 && (
              <li className="text-center py-6 text-gray-400 text-xs">Sin carpetas para "{busquedaDocs}".</li>
            )}
          </ul>
        </div>

        {/* Archivos recientes */}
        <div className="lg:col-span-2 bg-white border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-sm">Archivos recientes</h2>
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm min-w-125">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Nombre','Tipo','Obra','Tamaño','Fecha',''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archivosFiltrados.map((f, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700 max-w-50 truncate">{f.nombre}</p>
                    </td>
                    <td className="px-4 py-3"><FileTypeBadge tipo={f.tipo} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{f.obra}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">{f.size}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{f.fecha}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setArchivoSel(f)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast('Archivo descargado')} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                        <button onClick={() => showToast('Enlace copiado')} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {archivosFiltrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Sin archivos para "{busquedaDocs}".</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <ul className="md:hidden divide-y divide-gray-50">
            {archivosFiltrados.map((f, i) => (
              <li key={i} onClick={() => setArchivoSel(f)} className="px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-gray-50">
                <FileTypeBadge tipo={f.tipo} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{f.nombre}</p>
                  <p className="text-[11px] text-gray-400">{f.obra} · {f.size} · {f.fecha}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); showToast('Archivo descargado'); }} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors shrink-0">
                  <Download className="w-4 h-4" />
                </button>
              </li>
            ))}
            {archivosFiltrados.length === 0 && (
              <li className="text-center py-8 text-gray-400 text-sm">Sin archivos para "{busquedaDocs}".</li>
            )}
          </ul>
        </div>
      </div>

      <DemoModal open={carpetaSel !== null} onClose={() => setCarpetaSel(null)} title={carpetaSel?.nombre ?? ''}>
        {carpetaSel && <CarpetaDetalle carpeta={carpetaSel} />}
      </DemoModal>
      <DemoModal open={archivoSel !== null} onClose={() => setArchivoSel(null)} title={archivoSel?.nombre ?? ''}>
        {archivoSel && <ArchivoPreview archivo={archivoSel} />}
      </DemoModal>
      <DemoModal open={showSubirArchivo} onClose={() => setShowSubirArchivo(false)} title="Subir archivo">
        <FormSubirArchivo />
        <button
          onClick={() => { setShowSubirArchivo(false); showToast('Archivo subido'); }}
          className={submitClass}>
          Subir archivo
        </button>
      </DemoModal>
    </div>
  );
};

// ── Componente principal ────────────────────────────────────────────────────

export const Empresa = () => {
  usePageMeta({
    title: 'Panel de Gestión — Demo Empresa | Artifex',
    description:
      'Sistema demo para empresas: dashboard de KPIs, obras, clientes y facturación en una sola vista.',
    canonicalPath: '/business/empresas',
    noindex: true,
  });
  const [activeNav, setActiveNav] = useState('dashboard');
  const meta = sectionMeta[activeNav];
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [showConfiguracion, setShowConfiguracion] = useState(false);

  const views: Record<string, ReactElement> = {
    dashboard:  <ViewDashboard onNavigate={setActiveNav} />,
    obras:      <ViewObras />,
    clientes:   <ViewClientes />,
    informes:   <ViewInformes />,
    documentos: <ViewDocumentos />,
  };

  return (
    <div className="min-h-screen bg-[#F1F4F8] font-sans flex">

      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-[#16202E] text-white flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-0.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <p className="text-[11px] text-blue-400 font-bold uppercase tracking-widest">Sistema de Gestión</p>
          </div>
          <p className="font-bold text-sm text-white">Constructora del Litoral</p>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5 px-2">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium w-full text-left transition-colors rounded-sm ${
                activeNav === id
                  ? 'bg-blue-600 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 space-y-3">
          <a href={WA} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
            <MessageCircle className="w-4 h-4" /> Soporte
          </a>
          <button
            onClick={() => setShowConfiguracion(true)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
            <Settings className="w-4 h-4" /> Configuración
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header dinámico */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-mono">{meta.sub}</p>
            <h1 className="text-lg font-bold text-gray-800">{meta.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotificaciones(true)}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <div className="w-8 h-8 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded-full">AD</div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
            </div>
          </div>
        </header>

        {/* Vista activa */}
        <main className="flex-1 p-4 pb-24 md:p-5 md:pb-5 overflow-auto">
          {views[activeNav]}
        </main>
      </div>

      {/* Bottom nav — mobile only (native-app style tab bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 flex justify-around shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        {navItems.map(({ id, label, Icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </nav>

      <DemoModal open={showNotificaciones} onClose={() => setShowNotificaciones(false)} title="Notificaciones">
        <ul className="flex flex-col gap-1">
          {notificaciones.map((n, i) => (
            <li key={i} className="flex items-start gap-3 px-1 py-2.5 border-b border-white/5 last:border-0">
              <span className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                n.tipo === 'ok' ? 'bg-emerald-400' : n.tipo === 'warn' ? 'bg-amber-400' : 'bg-blue-400'
              }`} />
              <div>
                <p className="text-sm text-neutral-200 leading-relaxed">{n.msg}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{n.hora}</p>
              </div>
            </li>
          ))}
        </ul>
      </DemoModal>

      <DemoModal open={showConfiguracion} onClose={() => setShowConfiguracion(false)} title="Configuración">
        <FormConfiguracion />
      </DemoModal>

      <DemoBadge label="empresa" raised />
      <DemoToaster />
    </div>
  );
};
