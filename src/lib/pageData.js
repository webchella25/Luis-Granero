// src/lib/pageData.js - Estructura completa de datos de la homepage
export const homepageSchema = {
 hero: {
   title: "Luis Granero",
   subtitle: "Desarrollador Full Stack",
   description: "Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.",
   ctaText: "Ver mis proyectos",
   ctaLink: "/portfolio",
   backgroundVideo: "/videos/coding-bg.mp4",
   stats: [
     { label: "Proyectos", value: "50+" },
     { label: "Años", value: "10+" },
     { label: "Clientes", value: "35+" },
     { label: "Tecnologías", value: "15+" }
   ]
 },
 services: [
   {
     id: 1,
     icon: "⚛️",
     title: "Desarrollo React/Next.js",
     description: "Aplicaciones web modernas y escalables con las últimas tecnologías",
     features: ["SPA & PWA", "SSR/SSG", "Performance optimizado"],
     technologies: ["React", "Next.js", "TypeScript"],
     color: "from-cyan-400 to-blue-500",
     startingPrice: "1,500€",
     deliveryTime: "2-4 semanas"
   },
   {
     id: 2,
     icon: "🛒",
     title: "E-commerce Personalizado",
     description: "Tiendas online a medida sin limitaciones de plantillas genéricas",
     features: ["Payments integrados", "Dashboard admin", "SEO optimizado"],
     technologies: ["E-commerce", "Stripe", "APIs"],
     color: "from-green-400 to-emerald-500",
     startingPrice: "3,500€",
     deliveryTime: "4-8 semanas"
   },
   {
     id: 3,
     icon: "🚀",
     title: "Optimización & SEO",
     description: "Mejoro la velocidad y posicionamiento de sitios existentes",
     features: ["Core Web Vitals", "Technical SEO", "Performance audit"],
     technologies: ["SEO", "Performance", "Analytics"],
     color: "from-purple-400 to-pink-500",
     startingPrice: "800€",
     deliveryTime: "1-2 semanas"
   },
   {
     id: 4,
     icon: "💻",
     title: "Aplicaciones Web Personalizadas",
     description: "SPA, PWA y dashboards a medida para necesidades específicas",
     features: ["Dashboards", "PWA", "Integraciones"],
     technologies: ["React", "Node.js", "APIs"],
     color: "from-orange-400 to-red-500",
     startingPrice: "2,500€",
     deliveryTime: "3-6 semanas"
   },
   {
     id: 5,
     icon: "🔧",
     title: "APIs y Backend",
     description: "Desarrollo de APIs REST, bases de datos y arquitectura backend robusta",
     features: ["APIs REST", "Bases de datos", "Microservicios"],
     technologies: ["Node.js", "MongoDB", "Express"],
     color: "from-indigo-400 to-cyan-500",
     startingPrice: "1,200€",
     deliveryTime: "2-4 semanas"
   },
   {
     id: 6,
     icon: "🔍",
     title: "Auditorías Web",
     description: "Análisis completo de performance, UX y optimizaciones técnicas",
     features: ["Performance", "UX Audit", "Security"],
     technologies: ["Lighthouse", "GTMetrix", "Analytics"],
     color: "from-pink-400 to-purple-500",
     startingPrice: "400€",
     deliveryTime: "3-5 días"
   }
 ],
 techStack: [
   { name: "React", level: 95, color: "#61DAFB", category: "frontend" },
   { name: "Next.js", level: 90, color: "#000000", category: "frontend" },
   { name: "TypeScript", level: 85, color: "#3178C6", category: "frontend" },
   { name: "Tailwind CSS", level: 90, color: "#06B6D4", category: "frontend" },
   { name: "Node.js", level: 80, color: "#339933", category: "backend" },
   { name: "Express", level: 75, color: "#000000", category: "backend" },
   { name: "MongoDB", level: 75, color: "#47A248", category: "backend" },
   { name: "PostgreSQL", level: 70, color: "#336791", category: "backend" },
   { name: "Python", level: 70, color: "#3776AB", category: "backend" },
   { name: "Docker", level: 65, color: "#2496ED", category: "tools" },
   { name: "Git", level: 90, color: "#F05032", category: "tools" },
   { name: "Vercel", level: 85, color: "#000000", category: "tools" }
 ],
 cta: {
   title: "Hablemos de tu proyecto",
   description: "¿Tienes una idea increíble? ¿Necesitas modernizar tu web actual? ¿Buscas un desarrollador que entienda tu negocio?",
   options: [
     {
       icon: "💬",
       title: "Consulta Gratuita",
       description: "30 minutos para analizar tu proyecto sin compromiso",
       action: "Agendar llamada",
       link: "/contacto",
       highlight: true
     },
     {
       icon: "💻",
       title: "Presupuesto Express",
       description: "Calculadora automática para proyectos estándar",
       action: "Calcular precio",
       link: "/contacto#calculadora"
     },
     {
       icon: "📧",
       title: "Contacto Directo",
       description: "Escríbeme directamente con los detalles de tu proyecto",
       action: "Enviar mensaje",
       link: "/contacto#formulario"
     }
   ],
   mainCTA: {
     text: "Empezar mi proyecto ahora",
     link: "/contacto"
   },
   features: ["Respuesta en 24h", "Sin compromiso", "Consulta gratuita"]
 },
 testimonials: [
   {
     id: 1,
     name: "María González",
     company: "StartupTech",
     role: "CEO",
     content: "Luis transformó nuestra idea en una plataforma increíble. El resultado superó nuestras expectativas y los tiempos de entrega fueron impecables.",
     rating: 5,
     avatar: "/images/testimonials/maria.jpg",
     project: "Plataforma SaaS",
     metrics: {
       performance: "+40%",
       conversions: "+60%",
       loadTime: "1.1s"
     }
   },
   {
     id: 2,
     name: "Carlos Ruiz",
     company: "E-commerce Plus",
     role: "CTO",
     content: "La tienda online que desarrolló Luis incrementó nuestras ventas un 85% en los primeros 3 meses. Su enfoque técnico es excepcional.",
     rating: 5,
     avatar: "/images/testimonials/carlos.jpg",
     project: "E-commerce Personalizado",
     metrics: {
       sales: "+85%",
       performance: "95/100",
       mobile: "Perfect"
     }
   },
   {
     id: 3,
     name: "Ana Martínez",
     company: "Digital Agency",
     role: "Directora",
     content: "Trabajar con Luis fue una experiencia fantástica. Su comunicación es clara, cumple plazos y el código es de calidad profesional.",
     rating: 5,
     avatar: "/images/testimonials/ana.jpg",
     project: "Dashboard Corporativo",
     metrics: {
       efficiency: "+50%",
       users: "1000+",
       uptime: "99.9%"
     }
   },
   {
     id: 4,
     name: "Jorge López",
     company: "TechConsulting",
     role: "Founder",
     content: "Luis no solo desarrolla, sino que aporta ideas valiosas para mejorar el proyecto. Su experiencia se nota en cada línea de código.",
     rating: 5,
     avatar: "/images/testimonials/jorge.jpg",
     project: "Aplicación Web",
     metrics: {
       performance: "98/100",
       seo: "A+",
       security: "A+"
     }
   }
 ],
 featuredProjects: [
   {
     id: 1,
     title: "E-commerce Avanzado",
     description: "Plataforma de comercio electrónico con gestión avanzada de inventarios, múltiples métodos de pago y dashboard administrativo completo.",
     image: "🛍️",
     technologies: ["Next.js", "Node.js", "MongoDB", "Stripe"],
     metrics: {
       performance: "98/100",
       conversions: "+35%",
       loadTime: "1.2s"
     },
     status: "En producción",
     slug: "ecommerce-avanzado",
     category: "E-commerce",
     year: "2024"
   },
   {
     id: 2,
     title: "Dashboard Corporativo",
     description: "Sistema de gestión empresarial con análisis en tiempo real, reportes automatizados y integración con múltiples APIs externas.",
     image: "📊",
     technologies: ["React", "TypeScript", "Express", "PostgreSQL"],
     metrics: {
       performance: "96/100",
       users: "500+",
       dataPoints: "10M+"
     },
     status: "En desarrollo",
     slug: "dashboard-corporativo",
     category: "Dashboard",
     year: "2024"
   },
   {
     id: 3,
     title: "App de Reservas",
     description: "Aplicación web para gestión de reservas con calendario dinámico, notificaciones automáticas y sistema de pagos integrado.",
     image: "📅",
     technologies: ["Next.js", "Tailwind", "Firebase", "PayPal"],
     metrics: {
       performance: "99/100",
       bookings: "1000+",
       satisfaction: "4.9/5"
     },
     status: "En producción",
     slug: "app-reservas",
     category: "Aplicación Web",
     year: "2023"
   }
 ],
 seo: {
   metaTitle: "Luis Granero - Desarrollador Web Freelance | React, Next.js, Soluciones Personalizadas",
   metaDescription: "Desarrollador web freelance especializado en React, Next.js y soluciones personalizadas. Transformo ideas en aplicaciones web de alto rendimiento. +10 años de experiencia.",
   keywords: [
     "desarrollador web freelance",
     "react developer",
     "nextjs developer",
     "desarrollo web personalizado",
     "aplicaciones web",
     "ecommerce personalizado",
     "optimización web",
     "seo técnico",
     "desarrollo frontend",
     "desarrollo backend"
   ],
   openGraph: {
     title: "Luis Granero - Desarrollador Web Freelance",
     description: "Especializado en React, Next.js y soluciones web personalizadas",
     image: "/images/og-image.jpg",
     url: "https://luisgranero.com"
   },
   structuredData: {
     "@context": "https://schema.org",
     "@type": "Person",
     "name": "Luis Granero",
     "jobTitle": "Desarrollador Web Freelance",
     "description": "Desarrollador web especializado en React, Next.js y soluciones personalizadas",
     "url": "https://luisgranero.com",
     "sameAs": [
       "https://linkedin.com/in/luisgranero",
       "https://github.com/luisgranero"
     ],
     "knowsAbout": [
       "React",
       "Next.js",
       "TypeScript",
       "Node.js",
       "MongoDB",
       "Web Development",
       "E-commerce",
       "SEO"
     ]
   }
 },
 analytics: {
   enabled: true,
   googleAnalytics: "G-XXXXXXXXXX",
   hotjar: false,
   facebookPixel: false
 },
 contact: {
   email: "hola@luisgranero.com",
   phone: "+34 XXX XXX XXX",
   location: "España",
   availability: "Disponible para nuevos proyectos",
   responseTime: "24 horas",
   languages: ["Español", "Inglés"],
   timezone: "CET (UTC+1)"
 }
}

// Schema para validación y estructura del admin
export const homepageFields = {
 hero: {
   type: "object",
   properties: {
     title: { type: "string", maxLength: 100 },
     subtitle: { type: "string", maxLength: 150 },
     description: { type: "string", maxLength: 300 },
     ctaText: { type: "string", maxLength: 50 },
     ctaLink: { type: "string", format: "uri" },
     stats: {
       type: "array",
       items: {
         type: "object",
         properties: {
           label: { type: "string" },
           value: { type: "string" }
         }
       }
     }
   }
 },
 services: {
   type: "array",
   items: {
     type: "object",
     properties: {
       id: { type: "number" },
       icon: { type: "string" },
       title: { type: "string", maxLength: 100 },
       description: { type: "string", maxLength: 200 },
       features: { type: "array", items: { type: "string" } },
       technologies: { type: "array", items: { type: "string" } },
       color: { type: "string" }
     }
   }
 },
 techStack: {
   type: "array",
   items: {
     type: "object",
     properties: {
       name: { type: "string" },
       level: { type: "number", minimum: 0, maximum: 100 },
       color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
       category: { type: "string", enum: ["frontend", "backend", "tools"] }
     }
   }
 }
}

// Función para obtener datos por defecto
export function getDefaultHomepageData() {
 return homepageSchema;
}

// Función para validar estructura de datos
export function validateHomepageData(data) {
 // Aquí podrías agregar validación con una librería como Joi o Zod
 return true;
}

// Exportar también tipos para TypeScript (si usas TS)
export const HomepageTypes = {
 Hero: homepageSchema.hero,
 Service: homepageSchema.services[0],
 Technology: homepageSchema.techStack[0],
 Testimonial: homepageSchema.testimonials[0],
 Project: homepageSchema.featuredProjects[0]
}