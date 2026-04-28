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
