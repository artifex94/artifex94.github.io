// ============================================================
// BLOG DATA — Sistema modular y escalable
// Para agregar contenido: añadir entradas a posts[] o categories[]
// ============================================================

// --- TIPOS ---

export type ContentBlock =
  | { type: 'p';       text: string }
  | { type: 'h2';      text: string }
  | { type: 'h3';      text: string }
  | { type: 'code';    lang: string; text: string }
  | { type: 'ul';      items: string[] }
  | { type: 'ol';      items: string[] }
  | { type: 'callout'; text: string };

export interface BlogPost {
  slug:       string;
  title:      string;
  date:       string;       // 'YYYY-MM-DD'
  category:   string;       // slug de la categoria
  tags:       string[];
  summary:    string;
  readTime:   number;       // minutos estimados
  status:     'published' | 'draft';
  content:    ContentBlock[];
}

export interface BlogCategory {
  slug:        string;
  title:       string;
  description: string;
  accent:      string;  // clase tailwind para color de acento
}

// --- CATEGORIAS ---

export const categories: BlogCategory[] = [
  {
    slug:        'frontend',
    title:       'Frontend & UI',
    description: 'React, Next.js, TypeScript, TailwindCSS. Patrones, componentes y decisiones de UI que uso en proyectos reales.',
    accent:      'text-blue-400 border-blue-400',
  },
  {
    slug:        'ingenieria',
    title:       'Ingenieria de Software',
    description: 'Clean Code, Git, arquitectura, testing y algoritmos. Lo que aprendo en la carrera y lo que aplico en produccion.',
    accent:      'text-accent border-accent',
  },
  {
    slug:        'backend',
    title:       'Backend & Sistemas',
    description: 'Node.js, APIs REST, SQL, Java y administracion de sistemas. Desde la base de datos hasta la infraestructura.',
    accent:      'text-green-400 border-green-400',
  },
  {
    slug:        'herramientas',
    title:       'Herramientas & Workflow',
    description: 'Git, Vercel, Figma y el stack de productividad que uso. Setup, shortcuts y decisiones de tooling.',
    accent:      'text-purple-400 border-purple-400',
  },
  {
    slug:        'producto',
    title:       'Producto & Negocio',
    description: 'SCRUM, ADRs, OKRs y la interseccion entre desarrollo e ingenieria de producto. Construir cosas que sirven.',
    accent:      'text-yellow-400 border-yellow-400',
  },
];

// --- POSTS ---

export const posts: BlogPost[] = [

  // ── INGENIERIA ──────────────────────────────────────────────

  {
    slug:     'adrs-documentar-decisiones-arquitectura',
    title:    'ADRs: como documento mis decisiones de arquitectura',
    date:     '2026-04-20',
    category: 'ingenieria',
    tags:     ['arquitectura', 'documentacion', 'workflow'],
    summary:  'Un ADR (Architecture Decision Record) es un archivo de texto que responde una sola pregunta: por que tomamos esta decision y no otra. Llevo usandolos en todos mis proyectos y cambio la forma en que trabajo.',
    readTime: 4,
    status:   'published',
    content:  [
      {
        type: 'p',
        text: 'Cada proyecto tiene decisiones que parecen obvias en el momento y meses despues no recorda por que se tomaron. Un ADR resuelve exactamente ese problema.',
      },
      {
        type: 'h2',
        text: 'Que es un ADR',
      },
      {
        type: 'p',
        text: 'Un Architecture Decision Record es un documento corto — tipicamente entre 20 y 50 lineas — que captura una decision arquitectonica importante: que se decidio, por que, cuales eran las alternativas y cuales son las consecuencias esperadas.',
      },
      {
        type: 'h2',
        text: 'El formato que uso',
      },
      {
        type: 'ul',
        items: [
          'Titulo: una oracion que describe la decision (ej: "Usar Supabase como backend para el portal de clientes")',
          'Estado: propuesto / aceptado / deprecado / reemplazado',
          'Contexto: que problema existia que llevo a tomar esta decision',
          'Decision: que se decidio hacer',
          'Alternativas consideradas: que otras opciones se evaluaron y por que se descartaron',
          'Consecuencias: que implica esta decision a futuro (ventajas, limitaciones, deuda tecnica potencial)',
        ],
      },
      {
        type: 'h2',
        text: 'Cuando escribir uno',
      },
      {
        type: 'p',
        text: 'La regla que uso: si la decision afecta la arquitectura del sistema, va un ADR antes de escribir codigo. Esto incluye: eleccion de stack, estructura de base de datos, metodo de autenticacion, estrategia de deployment y cualquier libreria de terceros que sea dificil de reemplazar.',
      },
      {
        type: 'callout',
        text: 'El ADR no bloquea el trabajo — lo clarifica. En 20 minutos de escritura ahorras horas de confusion futura.',
      },
      {
        type: 'h2',
        text: 'Donde los guardo',
      },
      {
        type: 'p',
        text: 'En el repositorio del proyecto, dentro de una carpeta /docs/ADRs/. Estan versionados junto al codigo, entonces cualquier persona que entre al proyecto entiende las decisiones solo con git log.',
      },
    ],
  },

  {
    slug:     'gitflow-proyectos-a-medida',
    title:    'GitFlow en proyectos a medida: el setup que uso',
    date:     '2026-04-15',
    category: 'ingenieria',
    tags:     ['git', 'workflow', 'gitflow'],
    summary:  'GitFlow tiene fama de ser complejo para proyectos chicos. Mi version simplificada tiene solo tres reglas y funciona bien para proyectos de un solo desarrollador con clientes reales.',
    readTime: 5,
    status:   'published',
    content:  [
      {
        type: 'p',
        text: 'Cuando trabajas solo en un proyecto para un cliente, la tentacion es commitear directo a main. Funciona hasta que no funciona — hasta que un hotfix urgente pisa una feature a mitad de desarrollo.',
      },
      {
        type: 'h2',
        text: 'Las tres ramas que uso',
      },
      {
        type: 'ul',
        items: [
          'main: codigo en produccion. Nadie toca main directamente.',
          'develop: rama de integracion. Todo feature terminado llega aca primero.',
          'feature/nombre-descriptivo: una rama por cada funcionalidad nueva.',
        ],
      },
      {
        type: 'h2',
        text: 'El flujo en la practica',
      },
      {
        type: 'ol',
        items: [
          'Creo una rama feature/ desde develop: git checkout -b feature/portal-login',
          'Desarrollo la funcionalidad con commits descriptivos',
          'Cuando esta lista, PR o merge a develop',
          'Cuando develop esta estable, merge a main + tag de version',
        ],
      },
      {
        type: 'code',
        lang: 'bash',
        text: '# Nueva feature\ngit checkout develop\ngit checkout -b feature/mi-feature\n\n# Merge a develop cuando esta lista\ngit checkout develop\ngit merge feature/mi-feature --no-ff\n\n# Release a produccion\ngit checkout main\ngit merge develop --no-ff\ngit tag -a v1.2.0 -m "Portal de login"',
      },
      {
        type: 'h2',
        text: 'Hotfixes',
      },
      {
        type: 'p',
        text: 'Si hay un bug critico en produccion: rama hotfix/ desde main, fix, merge a main Y a develop para que el fix no se pierda en el proximo release.',
      },
      {
        type: 'callout',
        text: 'La regla de oro: nunca commitees directo a main. Nunca. Ni aunque sea "solo cambiar un texto".',
      },
    ],
  },

  {
    slug:     'evolucion-testing-software',
    title:    'La evolución del testing de software: de corregir errores a garantizar calidad',
    date:     '2026-04-30',
    category: 'ingenieria',
    tags:     ['testing', 'calidad', 'iso', 'ingenieria-software', 'apuntes'],
    summary:  'Setenta años de historia del testing en un artículo: las cinco visiones que transformaron la disciplina, terminología ISTQB (error, falla, defecto), el modelo de calidad McCall con sus 11 factores, la norma ISO 9126 y los cinco principios fundamentales del tester profesional.',
    readTime: 12,
    status:   'published',
    content:  [
      { type: 'p', text: 'Durante décadas, el testing de software fue visto como una actividad menor: algo que hacían los programadores al final del proceso, casi como un trámite. Hoy sabemos que esa visión no solo era incorrecta, sino costosa. La historia del testing es la historia de cómo la industria aprendió a tomarse en serio la calidad del software.' },
      { type: 'h2', text: '¿Qué son las pruebas de software?' },
      { type: 'p', text: 'Si le preguntamos a diez profesionales qué es hacer pruebas, obtenemos diez respuestas distintas: encontrar errores, adquirir confianza, verificar el funcionamiento, asegurar la satisfacción del cliente. Todas son aproximaciones correctas, pero ninguna captura la complejidad real de la disciplina.' },
      { type: 'p', text: 'La definición más abarcadora es la de Bill Hetzel (1988): el testing es cualquier actividad orientada a evaluar un atributo o capacidad de un programa y determinar si alcanza los resultados requeridos. Esta definición introduce el concepto de calidad como cumplimiento de requisitos — el corazón de la disciplina moderna.' },
      { type: 'h2', text: 'Las cinco visiones históricas del testing' },
      { type: 'p', text: 'La disciplina puede rastrearse desde los primeros programas escritos. Cada era produjo una visión diferente de qué significa probar software.' },
      { type: 'h3', text: 'Primera visión (1950s): probar es depurar' },
      { type: 'p', text: 'En los primeros años de la computación, las pruebas y el debugging eran la misma cosa. Si un programa fallaba, el programador buscaba el error y lo corregía. No había distinción conceptual entre encontrar un problema y solucionarlo. La prueba era una extensión directa de la programación.' },
      { type: 'h3', text: 'Segunda visión (1972): probar es generar confianza' },
      { type: 'p', text: 'Tras la primera conferencia formal de testing en Estados Unidos, emergió una nueva visión: las pruebas abarcan actividades asociadas a obtener confianza de que un programa hace lo que se supone que tiene que hacer. El énfasis pasó de corregir a confiar — un cambio conceptual pequeño pero significativo.' },
      { type: 'h3', text: 'Tercera visión (Myers, 1979): probar es buscar errores con intención' },
      { type: 'callout', text: '"El testing es el proceso de ejecutar un programa o sistema con la intención de encontrar errores." — Myers, 1979, p.5' },
      { type: 'p', text: 'Myers invirtió la lógica predominante: hasta entonces, muchos testers elegían casos que tenían baja probabilidad de hacer fallar el sistema. Myers argumentó lo contrario: los datos de prueba deben seleccionarse con alta probabilidad de causar fallas, no de que el sistema las supere. Un cambio radical que redefinió la profesión.' },
      { type: 'h3', text: 'Cuarta visión (1980s): el testing es continuo, no una fase final' },
      { type: 'p', text: 'Con los primeros estándares de la industria, el testing dejó de verse como algo al final del ciclo. Cualquier actividad orientada a evaluar un atributo del software — revisiones de requerimientos, inspecciones de código, controles de escritorio — es una forma de testing. Nace el concepto de pruebas tempranas.' },
      { type: 'h3', text: 'Quinta visión (actual): verificar y validar' },
      { type: 'p', text: 'La visión contemporánea distingue dos actividades clave. Verificar responde a ¿estamos construyendo el sistema correctamente? Validar responde a ¿estamos construyendo el sistema correcto? Esta distinción, formalizada por la norma ISO 9000 y sintetizada por Boehm (1981), es uno de los pilares de la ingeniería de software moderna.' },
      { type: 'h2', text: 'Error, falla y defecto: el vocabulario del ISTQB' },
      { type: 'p', text: 'Uno de los problemas históricos del testing fue la ambigüedad terminológica. El International Software Testing Qualifications Board (ISTQB) estableció definiciones precisas que hoy son el estándar internacional en todo el mundo.' },
      { type: 'ul', items: [
        'Error: la acción de equivocarse. El error está en la persona, no en el código.',
        'Defecto: el desperfecto en el código que resulta de un error humano. Es lo que el tester encuentra al inspeccionar el sistema.',
        'Falla: la diferencia entre el resultado esperado y el realmente obtenido durante la ejecución. La falla es observable; el defecto es su causa.',
      ]},
      { type: 'p', text: 'La cadena causal es: un error del desarrollador introduce un defecto en el código, que bajo ciertas condiciones de ejecución produce una falla observable. Un defecto no siempre produce una falla — solo cuando la ejecución pasa por esa parte del código defectuosa. Por eso el tester busca deliberadamente provocar fallas para detectar defectos antes que el usuario final.' },
      { type: 'h2', text: 'Medir la calidad: el modelo de McCall y la ISO 9126' },
      { type: 'h3', text: 'El modelo de McCall (1977)' },
      { type: 'p', text: 'Desarrollado originalmente para la Fuerza Aérea de Estados Unidos, el modelo de McCall define 11 factores de calidad organizados en tres perspectivas: Operación del producto (corrección, confiabilidad, usabilidad, integridad, eficiencia), Transición del producto (portabilidad, reutilización, interoperabilidad) y Revisión del producto (mantenibilidad, flexibilidad, facilidad de prueba).' },
      { type: 'p', text: 'Cada factor se desglosa en criterios medibles mediante listas de comprobación. El factor Corrección, por ejemplo, depende de la Completitud, la Trazabilidad y la Consistencia — cada una normalizada en el intervalo [0, 1]. Por primera vez, la calidad del software podía expresarse como un número, no como una impresión subjetiva.' },
      { type: 'h3', text: 'La norma ISO 9126' },
      { type: 'p', text: 'Adoptada en 2001 y reemplazada por ISO 25000 en 2005, la ISO 9126 consolida décadas de investigación en seis características de calidad: Funcionalidad, Fiabilidad, Usabilidad, Eficiencia, Mantenibilidad y Portabilidad. Cada una se divide en subcaracterísticas y se mide con métricas internas (estáticas), externas (dinámicas) o de uso (en operación real).' },
      { type: 'callout', text: 'Mensaje central de la ISO 9126: la calidad no es binaria. No existe software "de calidad" o "sin calidad" — existe software con distintos niveles en distintas dimensiones. Cada organización debe definir qué características importan más en su contexto.' },
      { type: 'h2', text: 'Los cinco principios fundamentales del tester' },
      { type: 'h3', text: 'Principio 1: la prueba completa no es posible' },
      { type: 'p', text: 'Por más pequeño que sea un programa, probar todos los casos posibles es computacionalmente imposible. No es una limitación práctica superable: es una imposibilidad teórica. La respuesta correcta es gestionar el riesgo, priorizar los casos con mayor probabilidad de revelar defectos críticos y distribuir el esfuerzo según el impacto potencial de cada falla.' },
      { type: 'h3', text: 'Principio 2: el trabajo de pruebas es creativo y difícil' },
      { type: 'p', text: 'Existe la falsa creencia de que cualquiera puede hacer pruebas sin experiencia. Hetzel (1988) identifica cuatro ingredientes esenciales: creatividad e intuición, conocimiento del negocio, experiencia en pruebas, y metodología. Los primeros tres no se enseñan en un curso — se desarrollan con la práctica y el estudio profundo del sistema.' },
      { type: 'h3', text: 'Principio 3: probar es también prevenir' },
      { type: 'p', text: 'Diseñar casos de prueba desde la etapa de requerimientos — antes de escribir una sola línea de código — obliga a pensar con precisión en el comportamiento esperado del sistema y detecta ambigüedades donde corregirlas es mucho menos costoso. El mejor proceso de pruebas es el que da feedback rápido.' },
      { type: 'h3', text: 'Principio 4: la prueba se basa en el riesgo' },
      { type: 'p', text: 'La cantidad de pruebas es directamente proporcional al riesgo de falla y al impacto que esa falla tendría. Un sistema de control de vuelos requiere cobertura radicalmente distinta a la de una app de notas. El riesgo es la brújula que guía qué probar, cuándo y con qué intensidad.' },
      { type: 'h3', text: 'Principio 5: la prueba debe ser planeada' },
      { type: 'p', text: 'Improvisar pruebas es casi tan ineficaz como no hacerlas. Un plan de pruebas define qué se va a probar, en qué orden, con qué criterios de éxito y con qué recursos. Es corolario del principio 1: si no se puede probar todo, se necesita una selección cuidadosa y una planificación rigurosa.' },
      { type: 'callout', text: '"Si no está ahí antes de que empiece la prueba, no estará cuando termine." — Roger Pressman, 2006' },
      { type: 'h2', text: 'Conclusión: la calidad no se compra, se construye' },
      { type: 'p', text: 'La historia del testing es la historia de una maduración colectiva. La industria aprendió — a veces con costos altísimos — que la calidad no se agrega al final del proceso. Se construye desde el principio, con intención, con metodología y con rigor. Los estándares ISTQB, ISO 9126 y el modelo de McCall no son burocracia académica: son el destilado de décadas de fracasos y aprendizajes. Conocerlos es la diferencia entre hacer pruebas y hacer pruebas bien.' },
    ],
  },

  {
    slug:     'arquitectura-software-fundamentos',
    title:    'Arquitectura de software: fundamentos, dificultades y deuda técnica',
    date:     '2026-04-28',
    category: 'ingenieria',
    tags:     ['arquitectura', 'deuda-tecnica', 'clean-code', 'metodologias', 'apuntes'],
    summary:  'Qué es la arquitectura de software según Bass, Taylor y Fowler. Cuáles son los problemas esenciales del desarrollo y por qué no hay bala de plata. Cómo clasificar y gestionar los cuatro tipos de deuda técnica. Y cuál es el rol del arquitecto frente a los distintos stakeholders del proyecto.',
    readTime: 8,
    status:   'published',
    content:  [
      { type: 'p', text: 'La arquitectura de software es uno de esos conceptos que todo el mundo usa pero pocos definen con precisión. ¿Es la estructura del código? ¿Las decisiones de diseño? ¿La forma del sistema? Dependiendo del autor, la respuesta cambia — y cada respuesta revela algo diferente sobre cómo entendemos el software.' },
      { type: 'h2', text: 'Tres definiciones de arquitectura de software' },
      { type: 'ul', items: [
        '"La arquitectura del sistema, compuesta por elementos de software, sus propiedades visibles y sus relaciones." — Bass, Clements & Kazman, Software Architecture in Practice (2003)',
        '"El conjunto de decisiones principales de diseño tomadas para el sistema." — Taylor, Software Architecture Foundations, Theory and Practice (2010)',
        '"La arquitectura se reduce a las cosas importantes, cualesquiera que sean." — Martin Fowler, Patterns of Enterprise Application Architecture (2002)',
      ]},
      { type: 'p', text: 'Cada definición enfatiza algo diferente. Bass se centra en la estructura. Taylor pone el foco en las decisiones. Fowler, influenciado por las metodologías ágiles, sugiere que la arquitectura no es algo que se diseña por fuera del equipo: emerge de él como resultado de las decisiones importantes que se van tomando en el camino.' },
      { type: 'h2', text: 'Los problemas esenciales del desarrollo de software' },
      { type: 'p', text: 'Frederick Brooks argumentó que los problemas del desarrollo de software se dividen en dos categorías: esenciales y accidentales. Esta distinción, conocida por su ensayo No Silver Bullet, sigue siendo vigente décadas después.' },
      { type: 'h3', text: 'Problemas esenciales' },
      { type: 'p', text: 'Tienen que ver con el problema que se va a resolver en sí mismo, no con la forma de implementarlo. Se dividen en cuatro tipos:' },
      { type: 'ul', items: [
        'Complejidad: cuando lo que hay que resolver es complejo en sí mismo, independientemente de cómo se implemente.',
        'Conformidad: ¿en qué contexto se va a utilizar el software y cómo tiene que adecuarse a ese contexto?',
        'Tolerancia al cambio: ¿puede el software cambiar una vez construido? Depende más de cuánto cambia el problema que de la tecnología elegida.',
        'Invisibilidad: el software no es tangible. Entender la forma del sistema solo a través del código o la documentación resulta inherentemente complejo.',
      ]},
      { type: 'h3', text: 'Problemas accidentales' },
      { type: 'p', text: 'Son los detalles de implementación y producción: lenguajes, integraciones, servidores, frameworks. Generan ganancias cuando se resuelven y muchos son solucionables con una librería o una API. Pero lo verdaderamente importante siempre es resolver los problemas esenciales.' },
      { type: 'callout', text: 'No hay ninguna bala de plata que solucione el problema esencial del desarrollo de software. — Frederick Brooks' },
      { type: 'h3', text: 'Cuatro formas de abordar los problemas esenciales' },
      { type: 'ol', items: [
        'No desarrollar: antes de escribir código, evaluar si el problema puede resolverse con software existente, open source, servicios o integraciones.',
        'Prototipado rápido: obtener feedback lo antes posible de si se está resolviendo el problema correcto. El feedback es la herramienta de desarrollo más importante del software moderno.',
        'Desarrollo evolutivo: construir en pasos pequeños y evolucionar iterativamente, validando en cada paso.',
        'Grandes diseñadores: personas con capacidad de diseñar soluciones simples que resuelven el problema de la mejor forma y con la mejor calidad.',
      ]},
      { type: 'h2', text: 'Deuda técnica: los cuatro tipos' },
      { type: 'p', text: 'Ward Cunningham introdujo el término deuda técnica en 1992. La metáfora es directa: la deuda técnica hace que un proyecto sea difícil de mantener y costoso de evolucionar, porque el código de baja calidad requiere mayor esfuerzo para interpretarse y modificarse. Cunningham identificó cuatro tipos, organizados por dos dimensiones.' },
      { type: 'ul', items: [
        'Imprudente y deliberada: los desarrolladores actúan conscientemente sin considerar las consecuencias de deuda que están acumulando. La peor categoría.',
        'Imprudente e inadvertida: la más común en perfiles junior. No se sabe que se está generando deuda por falta de conocimiento técnico.',
        'Prudente y deliberada: la deuda "sana". Es válido generarla conscientemente para ganar agilidad, siempre proyectando resolverla en el menor tiempo posible.',
        'Prudente e inadvertida: se tomaron todas las precauciones, pero con más experiencia se reconoce que podría haberse hecho mejor. La más honesta.',
      ]},
      { type: 'h3', text: '¿Qué es refactorizar y cuándo hacerlo?' },
      { type: 'p', text: 'La refactorización es el proceso de mejorar el código sin alterar su comportamiento, para que sea más entendible y tolerante a cambios. Es el mecanismo con el que se pagan las deudas. Antes de refactorizar, el código debe tener tests automáticos que validen el funcionamiento original — sin eso, no hay forma de garantizar que los cambios no rompan nada.' },
      { type: 'ul', items: [
        'Refactorizar cuando el código tiene baja calidad: duplicación, funciones con más de una responsabilidad, nombres crípticos.',
        'Refactorizar al detectar un code smell: cuando la estructura genera incomodidad técnica sin que haya un bug concreto aún visible.',
      ]},
      { type: 'callout', text: '"Nuestro código tiene que ser simple y directo, debería leerse con la misma facilidad que un texto bien escrito." — Grady Booch' },
      { type: 'h2', text: 'El rol del arquitecto: conectar stakeholders y sistema' },
      { type: 'p', text: 'El arquitecto de software no es simplemente el técnico más senior del equipo. Su rol es conectar los requerimientos de distintos stakeholders con la implementación del sistema.' },
      { type: 'ul', items: [
        'Cliente: necesita entregas a tiempo y dentro del presupuesto. El arquitecto gestiona los riesgos más altos del desarrollo.',
        'Manager: necesita comunicación clara entre equipos. El arquitecto provee modularización y flexibilidad del sistema.',
        'Desarrolladores: necesitan código fácil de implementar y mantener. El arquitecto garantiza modularidad y capacidad de cambio.',
        'Usuario final: necesita disponibilidad del producto. El arquitecto decide estrategias de disponibilidad.',
        'QA/Tester: necesita que el sistema sea fácil de probar. El arquitecto asegura que cada módulo pueda probarse de forma independiente.',
      ]},
      { type: 'h2', text: 'Proceso de desarrollo y roles en metodologías' },
      { type: 'p', text: 'El proceso de desarrollo tradicional tiene cinco etapas — Análisis de Requerimientos, Diseño de la Solución, Desarrollo y Evaluación, Despliegue, y Mantenimiento y Evolución — aunque en metodologías ágiles varias ocurren de forma iterativa y simultánea.' },
      { type: 'p', text: 'Una distinción importante: el rol no es lo mismo que el puesto de trabajo. En equipos pequeños, una misma persona puede cumplir varios roles. En metodologías tradicionales existen el Experto del dominio, el Analista, el Administrador de sistemas, el QA, el Desarrollador, el Arquitecto y el Gestor de proyecto. En metodologías ágiles, los roles equivalentes son los Stakeholders, el Product Owner, el DevOps/SRE, el Equipo de desarrollo autogestionado y el Facilitador.' },
      { type: 'p', text: 'La diferencia más significativa está en quién tiene autoridad sobre los requerimientos. En metodologías tradicionales, el Analista indaga qué hay que resolver. En metodologías ágiles, el Product Owner arma las historias de usuario, las prioriza y define iterativamente qué construye el equipo en cada sprint.' },
    ],
  },

  {
    slug:     'principios-testing-psicologia-tester',
    title:    'Los principios del testing moderno y la psicología del tester profesional',
    date:     '2026-05-01',
    category: 'ingenieria',
    tags:     ['testing', 'istqb', 'calidad', 'apuntes'],
    summary:  'Los siete principios del testing según el ISTQB, la mentalidad que diferencia a un tester competente de uno mediocre, y por qué el testing independiente produce mejores resultados que el auto-testing. Basado en apuntes académicos de la carrera.',
    readTime: 7,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'terminos-istqb-casos-de-prueba',
    title:    'Vocabulario ISTQB: condición de prueba, caso de prueba, cobertura y Gherkin',
    date:     '2026-05-01',
    category: 'ingenieria',
    tags:     ['testing', 'istqb', 'gherkin', 'cobertura', 'apuntes'],
    summary:  'La terminología precisa del ISTQB aplicada a proyectos reales: condición de prueba, caso de prueba formal vs. informal, cuándo usar Gherkin Given/When/Then, y cómo medir cobertura de decisiones versus cobertura de sentencias.',
    readTime: 9,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'design-patterns-creacionales-factory',
    title:    'Patrones creacionales GoF: Factory Method y Abstract Factory en TypeScript',
    date:     '2026-04-28',
    category: 'ingenieria',
    tags:     ['design-patterns', 'typescript', 'arquitectura', 'gof'],
    summary:  'Cuándo un simple new() no alcanza: cómo los patrones Factory Method y Abstract Factory resuelven la creación de objetos en sistemas que necesitan extensibilidad. Ejemplos en TypeScript extraídos del libro original de Gamma et al.',
    readTime: 8,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'clean-code-practico',
    title:    'Clean Code en la practica: lo que realmente uso',
    date:     '2026-04-10',
    category: 'ingenieria',
    tags:     ['clean-code', 'buenas-practicas', 'typescript'],
    summary:  'Clean Code de Robert Martin tiene principios excelentes y algunos que no aplican bien a proyectos web modernos. Este es el subconjunto que uso todos los dias.',
    readTime: 6,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'algoritmos-estructuras-datos-apuntes',
    title:    'Apuntes: Algoritmos y Estructuras de Datos',
    date:     '2026-03-20',
    category: 'ingenieria',
    tags:     ['algoritmos', 'apuntes', 'Siglo-XXI'],
    summary:  'Notas de la materia Algoritmos y Estructuras de Datos de la carrera en Universidad Siglo XXI. Arrays, listas enlazadas, arboles, grafos y complejidad algoritmica.',
    readTime: 12,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'pruebas-software-apuntes',
    title:    'Apuntes: Pruebas de Software',
    date:     '2026-03-15',
    category: 'ingenieria',
    tags:     ['testing', 'apuntes', 'Siglo-XXI'],
    summary:  'Notas de la materia Pruebas de Software de la carrera en Universidad Siglo XXI. Tipos de prueba, estrategias de testing y criterios de cobertura.',
    readTime: 8,
    status:   'draft',
    content:  [],
  },

  // ── FRONTEND ───────────────────────────────────────────────

  {
    slug:     'typescript-por-que-lo-uso-siempre',
    title:    'Por que uso TypeScript en cada proyecto nuevo',
    date:     '2026-04-22',
    category: 'frontend',
    tags:     ['typescript', 'javascript', 'react'],
    summary:  'No es por los tipos en si mismos. Es por el autocompletado, el refactoring seguro y la documentacion que emerge naturalmente del codigo. Argumentos concretos para convencer al cliente skeptico.',
    readTime: 5,
    status:   'published',
    content:  [
      {
        type: 'p',
        text: 'La conversacion tipica: el cliente pregunta si "necesitamos TypeScript" o si alcanza con JavaScript. La respuesta corta es: si el proyecto va a durar mas de un mes o lo va a tocar mas de una persona, TypeScript.',
      },
      {
        type: 'h2',
        text: 'El argumento real no son los tipos',
      },
      {
        type: 'p',
        text: 'El beneficio principal de TypeScript no es que detecta errores de tipo — aunque lo hace. Es que el IDE pasa a conocer la forma de tus datos y te ofrece autocompletado preciso, refactoring automatico confiable y documentacion inline que nunca queda desactualizada.',
      },
      {
        type: 'h2',
        text: 'Tres situaciones donde TypeScript pago la deuda',
      },
      {
        type: 'ul',
        items: [
          'Cambiar el nombre de una prop en un componente React: TypeScript marca todos los lugares donde se usa. En JS tendrias que buscar manualmente.',
          'Agregar un campo nuevo a una interfaz: el compilador te dice exactamente donde falta actualizar el resto del codigo.',
          'Consumir una API externa: definir el tipo de respuesta hace que el editor te diga que campos existen sin tener que volver a la documentacion.',
        ],
      },
      {
        type: 'h2',
        text: 'Como lo configuro en proyectos nuevos',
      },
      {
        type: 'code',
        lang: 'json',
        text: '// tsconfig.json — configuracion que uso como base\n{\n  "compilerOptions": {\n    "strict": true,\n    "noUncheckedIndexedAccess": true,\n    "exactOptionalPropertyTypes": true\n  }\n}',
      },
      {
        type: 'callout',
        text: 'Consejo: habilitá strict mode desde el inicio del proyecto. Agregarlo despues es doloroso.',
      },
    ],
  },

  {
    slug:     'ecmascript-moderno-features-que-uso',
    title:    'ECMAScript moderno: las features que uso en cada proyecto',
    date:     '2026-04-26',
    category: 'frontend',
    tags:     ['javascript', 'ecmascript', 'es6', 'typescript'],
    summary:  'Destructuring, optional chaining, nullish coalescing, Promise.allSettled y módulos ES. Las features de ES6 a ES2024 que cambian cómo escribo JavaScript todos los días — con ejemplos reales de uso en proyectos de producción.',
    readTime: 8,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'tailwindcss-patrones-reales',
    title:    'TailwindCSS en proyectos reales: patrones que uso',
    date:     '2026-04-05',
    category: 'frontend',
    tags:     ['tailwindcss', 'css', 'ui'],
    summary:  'Tailwind genera opiniones fuertes. Pasados dos anos usandolo en produccion, estos son los patrones que resuelven los problemas recurrentes: componentes consistentes, dark mode, responsive sin caos.',
    readTime: 7,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'react-componentes-datos-externos',
    title:    'Componentes React con datos externos: de fetch a UI',
    date:     '2026-03-28',
    category: 'frontend',
    tags:     ['react', 'hooks', 'typescript', 'API'],
    summary:  'El patron que uso para conectar componentes React a APIs REST: custom hooks, manejo de estados de carga/error y tipado end-to-end con TypeScript.',
    readTime: 8,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'framer-motion-animaciones-util',
    title:    'Framer Motion: animaciones que no molestan al usuario',
    date:     '2026-03-10',
    category: 'frontend',
    tags:     ['framer-motion', 'animaciones', 'ux'],
    summary:  'El error mas comun con animaciones es exagerar. Principios de motion design y los tres tipos de animacion que agrego a cualquier proyecto: entrada, transicion de estado y feedback de interaccion.',
    readTime: 5,
    status:   'draft',
    content:  [],
  },

  // ── BACKEND & SISTEMAS ─────────────────────────────────────

  {
    slug:     'rest-api-nodejs-estructura',
    title:    'REST APIs con Node.js: estructura basica que escala',
    date:     '2026-04-18',
    category: 'backend',
    tags:     ['nodejs', 'api', 'express', 'arquitectura'],
    summary:  'La estructura de carpetas y las decisiones de arquitectura que uso al iniciar una API REST con Node.js y Express. Controllers, services, repositories y manejo de errores centralizado.',
    readTime: 9,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'fundamentos-bases-de-datos-relacionales',
    title:    'Bases de datos relacionales: fundamentos que uso en proyectos web',
    date:     '2026-04-24',
    category: 'backend',
    tags:     ['sql', 'bases-de-datos', 'relacional', 'postgres'],
    summary:  'Modelo relacional, entidades y atributos, claves primarias y foráneas, normalización y cuándo denormalizar. Los conceptos que aplico al diseñar el esquema de base de datos de cualquier proyecto web.',
    readTime: 10,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'sql-patrones-aplicaciones-web',
    title:    'SQL para aplicaciones web: patrones de consulta que uso',
    date:     '2026-04-01',
    category: 'backend',
    tags:     ['sql', 'base-de-datos', 'postgres'],
    summary:  'Las consultas SQL que aparecen en practicamente todos los proyectos: paginacion, busqueda full-text, conteos con filtros y joins sin explotar la performance.',
    readTime: 10,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'softguard-configuracion-monitoreo',
    title:    'SoftGuard: configuracion de un sistema de monitoreo real',
    date:     '2026-03-05',
    category: 'backend',
    tags:     ['softguard', 'sistemas', 'seguridad'],
    summary:  'Ocho anos administrando sistemas SoftGuard para seguridad electronica. Configuracion de cuentas, zonas de alarma, integracion con Beat Netio y lo que aprendi gestionando una plataforma de monitoreo en produccion.',
    readTime: 11,
    status:   'draft',
    content:  [],
  },

  // ── HERRAMIENTAS & WORKFLOW ─────────────────────────────────

  {
    slug:     'setup-deploy-vercel',
    title:    'Mi setup de deployment en Vercel',
    date:     '2026-04-12',
    category: 'herramientas',
    tags:     ['vercel', 'deployment', 'ci-cd'],
    summary:  'Como configuro Vercel para proyectos de clientes: dominios custom, variables de entorno por ambiente, preview deployments y rollbacks en un clic.',
    readTime: 6,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'vitest-testing-library-react-vite',
    title:    'Testing en React con Vite: Vitest + Testing Library desde cero',
    date:     '2026-05-01',
    category: 'herramientas',
    tags:     ['vitest', 'testing-library', 'react', 'vite', 'typescript'],
    summary:  'Cómo configuré 100+ tests en un proyecto React + Vite sin Jest ni Babel: configuración de Vitest, mock de framer-motion con Proxy, renderWithProviders y los patrones de test que funcionan con React 19.',
    readTime: 10,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'playwright-automatizacion-capturas',
    title:    'Playwright para automatización: captura de OG image y más allá del e2e',
    date:     '2026-05-01',
    category: 'herramientas',
    tags:     ['playwright', 'automatizacion', 'seo', 'og-image'],
    summary:  'Playwright como herramienta de build: captura automática de OG images 1200×630, preview server automation, mock de matchMedia para prefers-reduced-motion e integración con npm scripts. Más allá del testing e2e.',
    readTime: 7,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'git-comandos-diarios',
    title:    'Git: los comandos que uso todos los dias',
    date:     '2026-04-08',
    category: 'herramientas',
    tags:     ['git', 'terminal', 'workflow'],
    summary:  'No los comandos basicos que ya sabe todo el mundo. Los que uso para situaciones reales: rebase interactivo, cherry-pick, bisect para encontrar bugs, y stash con nombre.',
    readTime: 7,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'obsidian-gestion-conocimiento',
    title:    'Obsidian como sistema de gestion de conocimiento personal',
    date:     '2026-03-25',
    category: 'herramientas',
    tags:     ['obsidian', 'productividad', 'conocimiento'],
    summary:  'Como estructure mi vault de Obsidian para gestionar conocimiento tecnico, proyectos y sesiones de trabajo. La arquitectura de lobulos y por que funciona mejor que un simple sistema de carpetas.',
    readTime: 8,
    status:   'draft',
    content:  [],
  },

  // ── PRODUCTO & NEGOCIO ─────────────────────────────────────

  {
    slug:     'scrum-ligero-proyectos-freelance',
    title:    'SCRUM ligero para proyectos freelance',
    date:     '2026-04-25',
    category: 'producto',
    tags:     ['scrum', 'agile', 'gestion', 'freelance'],
    summary:  'SCRUM completo tiene ceremonia que no escala a proyectos de un desarrollador. Esta version reducida — con backlog, sprints de dos semanas y definition of done — funciona bien con clientes reales.',
    readTime: 6,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'presupuestar-proyecto-web-argentina',
    title:    'Cómo presupuestar un proyecto web en Argentina: mi método',
    date:     '2026-04-27',
    category: 'producto',
    tags:     ['freelance', 'presupuesto', 'negocio', 'argentina'],
    summary:  'Descomponer un proyecto en horas reales, aplicar la tarifa correcta, manejar los pedidos de "algo rapido" y establecer condiciones de pago que protegen el trabajo. El método que uso para proyectos a medida desde landing pages hasta sistemas completos.',
    readTime: 7,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'modelo-negocio-desarrollador-freelance',
    title:    'El modelo de negocio del desarrollador freelance: lo que aprendí estructurándolo',
    date:     '2026-04-23',
    category: 'producto',
    tags:     ['freelance', 'negocio', 'bmc', 'emprendimiento'],
    summary:  'Aplicar el Business Model Canvas a un servicio de desarrollo freelance revela problemas que el código no puede resolver: segmentos mal definidos, canales sin testar y propuesta de valor que no resuena. Mi experiencia armando el modelo de negocios desde cero.',
    readTime: 9,
    status:   'draft',
    content:  [],
  },

  {
    slug:     'okrs-proyectos-personales',
    title:    'OKRs para proyectos personales: como los uso',
    date:     '2026-03-30',
    category: 'producto',
    tags:     ['okr', 'planificacion', 'objetivos'],
    summary:  'Los OKRs tienen fama de ser una herramienta corporativa. Llevo usandolos para gestionar mis propios proyectos y el ejercicio de definir resultados clave medibles cambia completamente como priorizo el trabajo.',
    readTime: 5,
    status:   'draft',
    content:  [],
  },

];

// --- HELPERS ---

export const getPostsByCategory = (slug: string): BlogPost[] =>
  posts.filter(p => p.category === slug && p.status === 'published');

export const getAllPublished = (): BlogPost[] =>
  posts.filter(p => p.status === 'published')
       .sort((a, b) => b.date.localeCompare(a.date));

export const getRecentPosts = (n = 5): BlogPost[] =>
  getAllPublished().slice(0, n);

export const getCategoryBySlug = (slug: string): BlogCategory | undefined =>
  categories.find(c => c.slug === slug);

export const getPostBySlug = (categorySlug: string, postSlug: string): BlogPost | undefined =>
  posts.find(p => p.category === categorySlug && p.slug === postSlug);

export const countByCategory = (slug: string): number =>
  posts.filter(p => p.category === slug && p.status === 'published').length;
