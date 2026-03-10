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
      professional: "dev@artifex.click",
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
        "Proyecto actual: Desarrollo de un portal de clientes (sección de usuario) para el monitoreo autogestionado de cuentas."
      ]
    }
  ],

  education: [
    {
      institution: "Universidad Siglo XXI",
      degree: "Licenciatura en Ciencias de la Computación (Cursado parcial equivalente a Analista de Sistemas)",
      period: "2021 - 2023",
    },
    {
      institution: "Argentina Programa",
      degree: "Desarrollador Full Stack (Java, SQL, JPA, JDBC)",
      period: "Feb 2024 - Sep 2024",
    },
    {
      institution: "Platzi",
      degree: "Más de 30 certificaciones en Desarrollo Web y Tecnologías",
      period: "2020 - Presente",
      details: "Cursos destacados en React, Next.js, Node.js y TypeScript. (Enlace a Linktree en construcción)."
    }
  ],

  skills: [
    {
      category: "Frontend",
      skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "TailwindCSS"]
    },
    {
      category: "Backend & Bases de Datos",
      skills: ["Node.js", "Java", "SQL", "JPA", "JDBC"]
    },
    {
      category: "Intereses & Exploración",
      skills: ["IoT (Internet of Things)", "Electrónica", "Arduino"]
    }
  ],

  projects: [
    {
      title: "Escobar Instalaciones - Landing Page",
      description: "Plataforma web corporativa desarrollada desde cero para presentar servicios de seguridad electrónica, domótica y monitoreo.",
      technologies: ["Next.js", "TypeScript", "React", "TailwindCSS"],
      liveUrl: "https://instalacionescob.ar",
      githubUrl: "https://github.com/artifex94/Ei-LandingPage.git"
    }
  ]
};