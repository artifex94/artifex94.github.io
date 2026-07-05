import { CONTACT_EMAIL } from './contact';
import platziCerts from './platzi-certs.json';

// Tipados base para asegurar la escalabilidad de los datos
export interface Project {
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
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
    social: { github: string; linkedin: string };
    aboutMe: string;
  };
  experience: Experience[];
  education: Education[];
  skills: SkillGroup[];
  projects: Project[];
}

// Los datos reales que alimentarán tu UI
export const data: PortfolioData = {
  personal: {
    name: "Ramiro Aníbal Escobar",
    aka: "Artifex Dev",
    title: "Software Solution Developer",
    emails: {
      professional: CONTACT_EMAIL,
      personal: "ramiroesc18@gmail.com",
    },
    social: {
      github: "https://github.com/artifex94",
      linkedin: "https://www.linkedin.com/in/ramiroescobar",
    },
    aboutMe: "Desarrollador orientado a soluciones con un fuerte background en administración de sistemas e integración de software. Combino mi experiencia técnica en redes y bases de datos con el desarrollo moderno frontend y backend para crear herramientas eficientes y escalables.",
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
      institution: "Universidad Siglo XXI",
      degree: "Ciencias de la Computación (cursado parcial)",
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
      degree: `+${(platziCerts as PlatziCert[]).length} certificaciones en Desarrollo Web`,
      period: "2020 - Presente",
      details: "React, Next.js, Node.js, TypeScript, Arquitectura de Software, Bases de Datos.",
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
    },
    {
      category: "Administración & Sistemas",
      skills: ["SoftGuard", "Beat Netio", "CRM", "Redes & Infraestructura"]
    }
  ],

  projects: [
    {
      title: "Escobar Instalaciones - Plataforma Corporativa",
      description:
        "Empresa de seguridad y domótica que necesitaba presencia profesional online y reducir la carga de atención telefónica. " +
        "Desarrollé el sitio corporativo completo y un portal de autogestión para que los clientes gestionen sus cuentas sin llamar.",
      technologies: ["Next.js", "TypeScript", "React", "TailwindCSS"],
      liveUrl: "https://instalacionescob.ar",
      githubUrl: "https://github.com/artifex94/Ei-LandingPage.git"
    },
    {
      title: "Portal de Autogestion - Escobar Instalaciones",
      description:
        "Los clientes no tenían forma de consultar el estado de sus cuentas sin llamar. " +
        "Desarrollando un portal privado con autenticación, dashboard de cuenta y gestión de servicios contratados.",
      technologies: ["Next.js", "TypeScript", "Supabase", "TailwindCSS"]
    },
    {
      title: "Demo - Presencia Digital para Profesionales",
      description:
        "Landing page para profesionales independientes que necesitan captar clientes online. " +
        "Sección de servicios, formulario de contacto, integración WhatsApp y diseño mobile-first orientado a conversión.",
      technologies: ["Next.js", "TypeScript", "TailwindCSS", "Vercel"]
    },
    {
      title: "Demo - Catálogo Digital para Comercios",
      description:
        "Sitio para tiendas y restaurantes que venden por WhatsApp sin catálogo ordenado. " +
        "Productos o menú en formato visual, pedidos por WhatsApp y ubicación en Google Maps. Optimizado para mobile.",
      technologies: ["React", "TypeScript", "TailwindCSS", "Vercel"]
    }
  ]
};