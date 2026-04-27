import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Phone, Star, ChevronRight, CheckCircle } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

const WA = "https://wa.me/5493436431987?text=Hola%2C%20quisiera%20sacar%20un%20turno.";

const servicios = [
  { nombre: 'Consulta General', duracion: '30 min', precio: '$8.000', desc: 'Diagnóstico y evaluación clínica completa.' },
  { nombre: 'Limpieza Dental', duracion: '45 min', precio: '$15.000', desc: 'Profilaxis y remoción de sarro profesional.' },
  { nombre: 'Blanqueamiento', duracion: '60 min', precio: '$35.000', desc: 'Tratamiento estético de última generación.' },
  { nombre: 'Ortodoncia', duracion: 'Consultar', precio: 'Desde $25.000', desc: 'Evaluación y plan de tratamiento personalizado.' },
];

const turnos = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

const testimonios = [
  { nombre: 'María G.', texto: 'Excelente atención, muy profesional y cálido.', stars: 5 },
  { nombre: 'Carlos R.', texto: 'El mejor odontólogo de Victoria, lo recomiendo.', stars: 5 },
  { nombre: 'Ana L.', texto: 'Muy puntual y el consultorio impecable.', stars: 5 },
];

export const Profesional: React.FC = () => {
  const [turnoSel, setTurnoSel] = useState('');
  const [diaSel, setDiaSel] = useState('');

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A6B8A] flex items-center justify-center text-white font-black text-sm">Dr</div>
          <div>
            <p className="font-bold text-[#1A3A4A] text-sm leading-none">Dr. Martín Sosa</p>
            <p className="text-xs text-[#1A6B8A]">Odontólogo · MN 12345</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-neutral-600">
          <a href="#servicios" className="hover:text-[#1A6B8A] transition-colors">Servicios</a>
          <a href="#turnos" className="hover:text-[#1A6B8A] transition-colors">Turnos</a>
          <a href="#ubicacion" className="hover:text-[#1A6B8A] transition-colors">Ubicación</a>
        </div>
        <a href={WA} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#1A6B8A] text-white px-4 py-2 text-sm font-bold rounded-full hover:bg-[#155a75] transition-colors">
          <Phone className="w-4 h-4" /> Turno online
        </a>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1A3A4A] to-[#1A6B8A] text-white px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="inline-block bg-white/10 text-white/80 text-xs px-3 py-1 rounded-full mb-4 uppercase tracking-widest">Victoria, Entre Ríos</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Tu salud dental<br /><span className="text-[#5ECDE3]">en buenas manos.</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-lg">
              Más de 10 años de experiencia en Victoria. Atención personalizada, tecnología de última generación y turnos rápidos.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={WA} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-[#5ECDE3] text-[#1A3A4A] px-6 py-3 font-bold rounded-full hover:bg-white transition-colors">
                <Calendar className="w-4 h-4" /> Sacar turno
              </a>
              <a href="#servicios"
                className="flex items-center gap-2 border border-white/30 text-white px-6 py-3 font-semibold rounded-full hover:bg-white/10 transition-colors">
                Ver servicios <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-center gap-3 min-w-[220px]">
              <CheckCircle className="w-8 h-8 text-[#5ECDE3] flex-shrink-0" />
              <div><p className="font-bold text-sm">+1.500 pacientes</p><p className="text-white/60 text-xs">atendidos en Victoria</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div><p className="font-bold text-sm">4.9 / 5 estrellas</p><p className="text-white/60 text-xs">en Google Maps</p></div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-center gap-3">
              <Clock className="w-8 h-8 text-[#5ECDE3] flex-shrink-0" />
              <div><p className="font-bold text-sm">Turnos en 24 hs</p><p className="text-white/60 text-xs">respuesta garantizada</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div id="servicios" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-extrabold text-[#1A3A4A] mb-2">Servicios</h2>
        <p className="text-neutral-500 mb-10">Tratamientos completos para toda la familia.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {servicios.map((s, i) => (
            <div key={i} className="border border-neutral-200 rounded-xl p-6 hover:shadow-md hover:border-[#1A6B8A] transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-[#1A3A4A] text-lg group-hover:text-[#1A6B8A] transition-colors">{s.nombre}</h3>
                <span className="text-[#1A6B8A] font-extrabold text-sm bg-[#1A6B8A]/10 px-3 py-1 rounded-full">{s.precio}</span>
              </div>
              <p className="text-neutral-500 text-sm mb-3">{s.desc}</p>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Clock className="w-3 h-3" /> {s.duracion}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sacar turno */}
      <div id="turnos" className="bg-[#F0F8FB] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-[#1A3A4A] mb-2">Reservá tu turno</h2>
          <p className="text-neutral-500 mb-10">Seleccioná el día y horario que más te convenga. Te confirmamos por WhatsApp.</p>
          <div className="bg-white rounded-2xl shadow-md p-6 text-left mb-6">
            <label className="block text-sm font-bold text-[#1A3A4A] mb-2">Seleccioná el día</label>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {['Lun 28', 'Mar 29', 'Mié 30', 'Jue 1', 'Vie 2'].map(d => (
                <button key={d} onClick={() => setDiaSel(d)}
                  className={`py-3 text-xs font-bold rounded-lg border transition-all ${diaSel===d ? 'bg-[#1A6B8A] text-white border-[#1A6B8A]' : 'border-neutral-200 text-neutral-600 hover:border-[#1A6B8A]'}`}>
                  {d}
                </button>
              ))}
            </div>
            <label className="block text-sm font-bold text-[#1A3A4A] mb-2">Seleccioná el horario</label>
            <div className="grid grid-cols-5 gap-2">
              {turnos.map(t => (
                <button key={t} onClick={() => setTurnoSel(t)}
                  className={`py-3 text-xs font-bold rounded-lg border transition-all ${turnoSel===t ? 'bg-[#1A6B8A] text-white border-[#1A6B8A]' : 'border-neutral-200 text-neutral-600 hover:border-[#1A6B8A]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <a href={`https://wa.me/5493436431987?text=Hola%2C%20quiero%20reservar%20turno${diaSel ? '%20el%20' + encodeURIComponent(diaSel) : ''}${turnoSel ? '%20a%20las%20' + encodeURIComponent(turnoSel) : ''}.`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#1A6B8A] text-white px-10 py-4 font-bold rounded-full hover:bg-[#155a75] transition-colors text-lg">
            <Calendar className="w-5 h-5" />
            {turnoSel && diaSel ? `Confirmar turno ${diaSel} · ${turnoSel}` : 'Confirmar por WhatsApp'}
          </a>
        </div>
      </div>

      {/* Testimonios */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-extrabold text-[#1A3A4A] mb-8 text-center">Lo que dicen mis pacientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {Array.from({length:t.stars}).map((_,j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-neutral-600 text-sm mb-4 italic">"{t.texto}"</p>
              <p className="font-bold text-[#1A3A4A] text-sm">{t.nombre}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ubicación */}
      <div id="ubicacion" className="bg-[#1A3A4A] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <MapPin className="w-8 h-8 text-[#5ECDE3] flex-shrink-0" />
            <div>
              <p className="font-bold text-lg">Consultorio en el Centro</p>
              <p className="text-white/60 text-sm">25 de Mayo 412, Victoria, Entre Ríos</p>
              <p className="text-white/60 text-sm mt-1">Lunes a Viernes · 9:00 a 17:00 hs</p>
            </div>
          </div>
          <a href={WA} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-[#5ECDE3] text-[#1A3A4A] px-8 py-3 font-bold rounded-full hover:bg-white transition-colors">
            <Phone className="w-4 h-4" /> Llamar / WhatsApp
          </a>
        </div>
      </div>

      <DemoBadge label="profesionales" />
    </div>
  );
};
