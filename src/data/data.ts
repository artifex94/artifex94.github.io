import platziCerts from './platzi-certs.json';

// Tipados base para asegurar la escalabilidad de los datos
export interface Project {
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  tag?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string[];
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  details?: string;
}

export interface PlatziCert {
  name: string;
  school: string;
  completedAt: string | null;
  url: string | null;
  imageUrl: string | null;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface PortfolioData {
  personal: {
    name: string;
    aka: string;
    title: string;
    emails: { professional: string; personal: string };
    social: { github: string; linkedin: string; whatsapp: string };
    aboutMe: string;
  };
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
}

export const data: PortfolioData = {
  personal: {
    name: "Ramiro Anibal Escobar",
    aka: "Artifex Dev",
    title: "Software Solution Developer",
    emails: {
      professional: "dev@artifex.click",
      personal: "ramiroesc18@gmail.com",
    },
    social: {
      github: "https://github.com/artifex94",
      linkedin: "https://www.linkedin.com/in/ramiroescobar",
      whatsapp: "https://wa.me/5493436431987?text=Hola%20Ramiro%2C%20vi%20tu%20portfolio%20y%20me%20interesa%20hablar%20sobre%20un%20proyecto.",
    },
    aboutMe:
      "Si tu negocio no tiene presencia online, te estas perdiendo clientes que ya buscan lo que ofrecés. " +
      "Desarrollo sitios web y sistemas digitales para empresas y emprendedores que quieren resultados concretos: " +
      "mas consultas, operaciones ordenadas y una imagen profesional que genera confianza. " +
      "Precios claros, entrega en tiempo y soporte real.",
  },

  experience: [
    {
      company: "Escobar Instalaciones",
      role: "Administrador de Sistemas & Software Developer",
      period: "2016 - Presente",
      description: [
        "Implementacion y gestion de software de monitoreo SoftGuard para sistemas de seguridad, domotica, control de acceso y rastreo GPS.",
        "Administracion integral del CRM, saneamiento de bases de datos y configuracion de sistemas de alarma mediante Beat Netio.",
        "Desarrollo y mantenimiento de la Landing Page corporativa utilizando Next.js y TypeScript.",
        "Desarrollo de portal de clientes para monitoreo autogestionado de cuentas de seguridad.",
      ],
    },
  ],

  education: [
    {
      institution: "Universidad Siglo XXI",
      degree: "Ciencias de la Computacion (cursado parcial)",
      period: "2022 - Presente",
      details: "Cursado parcial equivalente a Analista de Sistemas. Materias completadas: Algoritmos, Estructuras de Datos y Pruebas de Software.",
    },
    {
      institution: "Argentina Programa",
      degree: "Desarrollador Full Stack (Java, SQL, JPA, JDBC)",
      period: "Feb 2024 - Sep 2024",
    },
    {
      institution: "Platzi",
      degree: `+${(platziCerts as unknown[]).length} certificaciones en Desarrollo Web`,
      period: "2020 - Presente",
      details: "React, Next.js, Node.js, TypeScript, Arquitectura de Software, Bases de Datos.",
    },
  ],

  skills: [
    {
      category: "Frontend",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "Framer Motion"],
    },
    {
      category: "Backend & Bases de Datos",
      skills: ["Node.js", "Java", "SQL", "REST APIs"],
    },
    {
      category: "Herramientas & Workflow",
      skills: ["Git", "GitHub", "Vercel", "Figma", "Clean Code"],
    },
    {
      category: "Administracion & Sistemas",
      skills: ["SoftGuard", "Beat Netio", "CRM", "Redes & Infraestructura"],
    },
  ],

  projects: [
    {
      title: "Escobar Instalaciones - Plataforma Corporativa",
      description:
        "Empresa de seguridad y domotica que necesitaba presencia profesional online y reducir la carga de atencion telefonica. " +
        "Desarrolle el sitio corporativo completo y un portal de autogestion para que los clientes gestionen sus cuentas sin llamar.",
      technologies: ["Next.js", "TypeScript", "React", "TailwindCSS"],
      liveUrl: "https://instalacionescob.ar",
      githubUrl: "https://github.com/artifex94/Ei-LandingPage.git",
      tag: "Proyecto Real",
    },
    {
      title: "Portal de Autogestion - Escobar Instalaciones",
      description:
        "Los clientes no tenian forma de consultar el estado de sus cuentas sin llamar. " +
        "Desarrollando un portal privado con autenticacion, dashboard de cuenta y gestion de servicios contratados.",
      technologies: ["Next.js", "TypeScript", "Supabase", "TailwindCSS"],
      tag: "En Desarrollo",
    },
    {
      title: "Demo - Presencia Digital para Profesionales",
      description:
        "Landing page para profesionales independientes que necesitan captar clientes online. " +
        "Seccion de servicios, formulario de contacto, integracion WhatsApp y diseño mobile-first orientado a conversion.",
      technologies: ["Next.js", "TypeScript", "TailwindCSS", "Vercel"],
      tag: "Demo",
    },
    {
      title: "Demo - Catalogo Digital para Comercios",
      description:
        "Sitio para tiendas y restaurantes que venden por WhatsApp sin catalogo ordenado. " +
        "Productos o menu en formato visual, pedidos por WhatsApp y ubicacion en Google Maps. Optimizado para mobile.",
      technologies: ["React", "TypeScript", "TailwindCSS", "Vercel"],
      tag: "Demo",
    },
  ],
};
