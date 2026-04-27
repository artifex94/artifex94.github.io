import { Star, MessageCircle, CheckCircle, Heart, Award, Sparkles, ArrowRight, Menu } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

const WA      = "https://wa.me/5493436431987?text=Hola%2C%20me%20interesa%20hablar%20con%20Valentina%20sobre%20coaching.";
const WA_FREE = "https://wa.me/5493436431987?text=Hola%2C%20quiero%20agendar%20mi%20sesi%C3%B3n%20de%20descubrimiento%20gratuita.";

const servicios = [
  {
    badge: "Individual",
    titulo: "Coaching 1:1",
    desc: "Sesiones de 60 min para trabajar objetivos, bloqueos y próximos pasos con acompañamiento personalizado.",
    precio: "$8.000",
    unit: "por sesión",
    items: ["Diagnóstico inicial sin cargo", "Plan de acción personalizado", "Seguimiento por WhatsApp"],
    popular: false,
  },
  {
    badge: "Más elegido",
    titulo: "Programa 90 Días",
    desc: "Transformación real: construimos hábitos duraderos con metas claras y acompañamiento continuo.",
    precio: "$45.000",
    unit: "programa completo",
    items: ["12 sesiones 1:1", "Recursos y ejercicios semanales", "Acceso directo por WhatsApp", "Garantía de satisfacción"],
    popular: true,
  },
  {
    badge: "Grupal",
    titulo: "Talleres Online",
    desc: "Encuentros mensuales en vivo para aprender herramientas de bienestar con personas en el mismo camino.",
    precio: "$3.500",
    unit: "por taller",
    items: ["Grupos de hasta 15 personas", "Grabación disponible 7 días", "Material descargable"],
    popular: false,
  },
];

const testimonios = [
  { nombre: "Luciana M.", ciudad: "Rosario",      texto: "El programa de 90 días cambió completamente mi relación con el trabajo y el descanso. Valentina te acompaña de una forma única.", estrellas: 5 },
  { nombre: "Martín A.", ciudad: "Buenos Aires",   texto: "Las sesiones son claras y directas. En dos meses avancé más que en años intentándolo solo.", estrellas: 5 },
  { nombre: "Camila V.", ciudad: "Córdoba",        texto: "Los talleres grupales me dieron herramientas que aplico todos los días. Ideal para empezar.", estrellas: 5 },
];

export const Emprendedor = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans text-[#1C2B2B]">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#7DA87B] fill-[#7DA87B]" />
          <span className="font-bold text-lg tracking-tight">Valentina Ríos</span>
          <span className="hidden sm:inline text-stone-400 text-sm">— Coaching de Bienestar</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-stone-500 font-medium">
          <button className="hover:text-[#1C2B2B] transition-colors">Servicios</button>
          <button className="hover:text-[#1C2B2B] transition-colors">Sobre mí</button>
          <button className="hover:text-[#1C2B2B] transition-colors">Testimonios</button>
        </div>
        <div className="flex items-center gap-3">
          <a href={WA_FREE} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 bg-[#7DA87B] text-white text-sm font-semibold px-4 py-2 hover:bg-[#6B9869] transition-colors">
            Sesión gratuita
          </a>
          <button className="md:hidden text-stone-500"><Menu className="w-5 h-5" /></button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#EEF4EC] to-[#FAFAF8] py-20 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-[#7DA87B]/15 text-[#4E7A4C] text-xs font-semibold px-3 py-1 mb-5 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Coaching certificado ICF
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Vivir mejor no es suerte.<br />
              <span className="text-[#7DA87B]">Es una decisión.</span>
            </h1>
            <p className="text-stone-500 mb-8 text-lg leading-relaxed max-w-xl">
              Te acompaño a identificar lo que te frena y construir la vida que querés — con claridad, hábitos reales y pasos concretos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href={WA_FREE} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-[#7DA87B] text-white font-bold px-8 py-3 hover:bg-[#6B9869] transition-colors text-sm">
                <Sparkles className="w-4 h-4" />
                Primera sesión gratis
              </a>
              <a href={WA} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 border border-[#1C2B2B]/20 font-semibold px-8 py-3 hover:border-[#7DA87B] hover:text-[#7DA87B] transition-colors text-sm">
                Ver programas <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-4 mt-8 justify-center md:justify-start">
              <div className="flex -space-x-2">
                {['L','M','S','C'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-[#D8E8D6] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#4E7A4C]">{l}</div>
                ))}
              </div>
              <p className="text-sm text-stone-500"><strong className="text-[#1C2B2B]">+120 personas</strong> acompañadas</p>
            </div>
          </div>
          <div className="w-56 h-56 md:w-72 md:h-72 bg-[#D8E8D6] rounded-full flex items-center justify-center shrink-0 relative">
            <div className="text-center text-[#4E7A4C]">
              <Award className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium opacity-50">Foto de perfil</p>
            </div>
            <div className="absolute -bottom-3 -right-3 bg-white border border-stone-100 shadow-md px-3 py-2 text-xs font-semibold text-[#1C2B2B] flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 5.0 · 47 reseñas
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Formas de trabajar juntos</h2>
          <p className="text-stone-500">Elegí el formato que mejor se adapte a tu momento.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicios.map((s, i) => (
            <div key={i} className={`relative border flex flex-col gap-5 p-6 transition-all ${
              s.popular
                ? 'border-[#7DA87B] bg-[#F0F7EE] shadow-lg'
                : 'border-stone-200 bg-white hover:border-[#7DA87B] hover:shadow-sm'
            }`}>
              {s.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7DA87B] text-white text-[11px] font-bold px-3 py-0.5 uppercase tracking-wide">
                  {s.badge}
                </span>
              )}
              {!s.popular && (
                <p className="text-[11px] text-[#7DA87B] font-bold uppercase tracking-widest">{s.badge}</p>
              )}
              <div>
                <h3 className="text-xl font-bold mb-2">{s.titulo}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-stone-600">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#7DA87B] mt-0.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-4 border-t border-stone-100">
                <p className="text-2xl font-extrabold">{s.precio}
                  <span className="text-sm text-stone-400 font-normal ml-1">{s.unit}</span>
                </p>
                <a href={WA} target="_blank" rel="noreferrer"
                  className={`mt-3 block text-center py-2.5 font-semibold text-sm transition-colors ${
                    s.popular
                      ? 'bg-[#7DA87B] text-white hover:bg-[#6B9869]'
                      : 'border border-[#7DA87B] text-[#7DA87B] hover:bg-[#7DA87B] hover:text-white'
                  }`}>
                  Consultar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonios */}
      <div className="bg-[#EEF4EC] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Lo que dicen quienes ya trabajaron conmigo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonios.map((t, i) => (
              <div key={i} className="bg-white p-5 border border-stone-100 shadow-sm">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.estrellas }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">"{t.texto}"</p>
                <p className="font-semibold text-sm">{t.nombre}
                  <span className="text-stone-400 font-normal"> — {t.ciudad}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="bg-[#1C2B2B] py-16 px-6 text-center text-white">
        <p className="text-[#7DA87B] text-sm font-bold uppercase tracking-widest mb-3">Sin cargo ni compromiso</p>
        <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
        <p className="text-stone-400 mb-8 max-w-md mx-auto">
          La primera sesión es gratuita. Hablamos 30 minutos, entiendo dónde estás y te cuento cómo puedo acompañarte.
        </p>
        <a href={WA_FREE} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold px-10 py-4 hover:bg-[#1ebe5d] transition-colors">
          <MessageCircle className="w-5 h-5" />
          Agendar sesión gratuita
        </a>
      </div>

      <footer className="bg-[#162020] text-stone-600 text-center py-6 text-sm">
        Valentina Ríos Coaching · Buenos Aires, Argentina ·{' '}
        <a href={WA} className="text-[#7DA87B] hover:underline">Contacto</a>
      </footer>

      <DemoBadge label="emprendedora" />
    </div>
  );
};
