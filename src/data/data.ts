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
    name: "Ramiro Aníbal Escobar",
    aka: "Artifex Dev",
    title: "Software Solution Developer",
    emails: {
      professional: "dev@artifex.click",
      personal: "ramiroesc18@gmail.com",
    },
    social: {
      github: "https://github.com/artifex94",
      linkedin: "https://www.linkedin.com/in/ramiroescobar",
      whatsapp: "https://wa.me/5493XXXXXXXXX?text=Hola%20Ramiro%2C%20vi%20tu%20portfolio%20y%20me%20interesa%20hablar%20sobre%20un%20proyecto.",
    },
    aboutMe:
      "Desarrollo plataformas digitales a medida para empresas, negocios y emprendedores que necesitan software que funcione. Combino ingeniería de software moderna con visión de negocio para entregar sistemas que generan resultados reales: más clientes, operaciones más eficientes y presencia digital que convierte.",
  },

  experience: [
    {
      company: "Escobar Instalaciones",
      role: "Administrador de Sistemas & Software Developer",
      period: "2016 - Presente",
      description: [
        "Implementación y gestión de software de monitoreo SoftGuard para sistemas de seguridad, domótica, control de acceso y rastreo GPS.",
        "Administración integral del CRM, saneamiento de bases de datos y configuración de sistemas de alarma mediante Beat Netio.",
        "Desarrollo y mantenimiento de la Landing Page corporativa utilizando Next.js y TypeScript.",
        "Desarrollo de portal de clientes para monitoreo autogestionado de cuentas de seguridad."
      ]
    }
  ],

  education: [
    {
      institution: "Universidad Nacional de Entre Ríos (UNER)",
      degree: "Ingeniería en Informática",
      period: "2022 - Presente",
      details: "Cursando materias de Algoritmos y Estructuras de Datos, Pruebas de Software y Principios de Economía."
    },
    {
      institution: "Argentina Programa",
      degree: "Desarrollador Full Stack (Java, SQL, JPA, JDBC)",
      period: "Feb 2024 - Sep 2024",
    },
    {
      institution: "Platzi",
      degree: "+20 certificaciones en Desarrollo Web",
      period: "2020 - Presente",
      details: "React, Next.js, Node.js, TypeScript, Arquitectura de Software, Bases de Datos."
    }
  ],

  skills: [
    {
      category: "Frontend",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS", "Framer Motion"]
    },
    {
      category: "Backend & Bases de Datos",
      skills: ["Node.js", "Java", "SQL", "REST APIs"]
    },
    {
      category: "Herramientas & Workflow",
      skills: ["Git", "GitHub", "Vercel", "Figma", "Clean Code"]
    }
  ],

  projects: [
    {
      title: "Escobar Instalaciones — Plataforma Corporativa",
      description:
        "Sitio web corporativo completo para empresa de seguridad electrónica y domótica. Incluye presentación de servicios, sección de contacto y portal de clientes en desarrollo para monitoreo autogestionado.",
      technologies: ["Next.js", "TypeScript", "React", "TailwindCSS"],
      liveUrl: "https://instalacionescob.ar",
      githubUrl: "https://github.com/artifex94/Ei-LandingPage.git",
      tag: "Proyecto Real"
    },
    {
      title: "Demo — Presencia Digital para Profesionales",
      description:
        "Landing page diseñada para profesionales independientes (médicos, abogados, contadores). Incluye sección de servicios, formulario de contacto, integración WhatsApp y diseño mobile-first orientado a captación de clientes.",
      technologies: ["Next.js", "TypeScript", "TailwindCSS", "Vercel"],
      tag: "Demo"
    },
    {
      title: "Demo — Catálogo Digital para Comercios",
      description:
        "Sitio web para tiendas y restaurantes locales. Presenta productos o menú en formato visual, integra pedidos por WhatsApp y muestra ubicación con Google Maps. Optimizado para conversión mobile.",
      technologies: ["React", "TypeScript", "TailwindCSS", "Vercel"],
      tag: "Demo"
    }
  ]
};
