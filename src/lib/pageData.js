// src/lib/pageData.js - Estructura de datos de la homepage
export const homepageSchema = {
  hero: {
    title: "Desarrollador Web Freelance",
    subtitle: "Especializado en React, Next.js y soluciones personalizadas",
    description: "Transformo ideas en experiencias web de alto rendimiento. Más de 10 años creando soluciones digitales que generan resultados reales.",
    ctaText: "Ver mis proyectos",
    ctaLink: "/portfolio",
    backgroundVideo: "/videos/coding-bg.mp4"
  },
  services: [
    {
      id: 1,
      icon: "⚛️",
      title: "Desarrollo React/Next.js",
      description: "Aplicaciones web modernas y escalables con las últimas tecnologías",
      features: ["SPA & PWA", "SSR/SSG", "Performance optimizado"]
    },
    {
      id: 2,
      icon: "🛒",
      title: "E-commerce Personalizado",
      description: "Tiendas online a medida sin limitaciones de plantillas",
      features: ["Payments integrados", "Dashboard admin", "SEO optimizado"]
    },
    {
      id: 3,
      icon: "🚀",
      title: "Optimización & SEO",
      description: "Mejoro la velocidad y posicionamiento de sitios existentes",
      features: ["Core Web Vitals", "Technical SEO", "Performance audit"]
    }
  ],
  techStack: [
    { name: "React", level: 95, color: "#61DAFB" },
    { name: "Next.js", level: 90, color: "#000000" },
    { name: "TypeScript", level: 85, color: "#3178C6" },
    { name: "Node.js", level: 80, color: "#339933" },
    { name: "MongoDB", level: 75, color: "#47A248" },
    { name: "Tailwind CSS", level: 90, color: "#06B6D4" }
  ],
  stats: [
    { label: "Proyectos completados", value: "50+" },
    { label: "Años de experiencia", value: "10+" },
    { label: "Clientes satisfechos", value: "35+" },
    { label: "Tecnologías dominadas", value: "15+" }
  ],
  testimonials: [
    {
      id: 1,
      name: "María González",
      company: "StartupTech",
      role: "CEO",
      content: "Luis transformó nuestra idea en una plataforma increíble. El resultado superó nuestras expectativas.",
      rating: 5,
      avatar: "/images/testimonials/maria.jpg"
    }
  ]
}