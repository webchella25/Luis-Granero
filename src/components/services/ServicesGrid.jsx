// src/components/services/ServicesGrid.jsx (versión actualizada)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function ServicesGrid() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Servicios por defecto como fallback (SIN PRECIOS)
  const defaultServices = [
    {
      id: 1,
      title: "Desarrollo Web Moderno",
      subtitle: "React, Next.js & TypeScript",
      description: "Aplicaciones web escalables con las últimas tecnologías. Código limpio, documentado y optimizado para rendimiento.",
      icon: "💻",
      technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      color: "from-cyan-400 to-blue-500",
      features: [
        "Single Page Applications (SPA)",
        "Server Side Rendering (SSR)",
        "Progressive Web Apps (PWA)",
        "Optimización SEO técnico",
        "Performance 90+ en Lighthouse"
      ]
    },
    {
      id: 2,
      title: "E-commerce Personalizado",
      subtitle: "Tiendas online sin límites",
      description: "Plataformas de comercio electrónico a medida con integración de pagos, gestión de inventario y analytics avanzados.",
      icon: "🛒",
      technologies: ["E-commerce", "Stripe", "PayPal", "Analytics"],
      color: "from-green-400 to-emerald-500",
      features: [
        "Integración de pagos múltiples",
        "Dashboard de administración",
        "Gestión de inventario",
        "Analytics y reportes",
        "Optimización conversiones"
      ]
    },
    {
      id: 3,
      title: "APIs & Backend",
      subtitle: "Arquitecturas escalables",
      description: "Desarrollo de APIs REST y GraphQL, microservicios y arquitecturas backend robustas para aplicaciones complejas.",
      icon: "⚙️",
      technologies: ["Node.js", "Express", "MongoDB", "PostgreSQL"],
      color: "from-purple-400 to-pink-500",
      features: [
        "APIs REST y GraphQL",
        "Autenticación JWT",
        "Base de datos optimizada",
        "Documentación automática",
        "Testing automatizado"
      ]
    },
    {
      id: 4,
      title: "Aplicaciones Web Complejas",
      subtitle: "Dashboards & Sistemas",
      description: "Sistemas de gestión, CRM, dashboards analíticos y aplicaciones empresariales con múltiples roles de usuario.",
      icon: "📊",
      technologies: ["React", "Chart.js", "D3.js", "Real-time"],
      color: "from-orange-400 to-red-500",
      features: [
        "Dashboards interactivos",
        "Múltiples roles de usuario",
        "Reportes avanzados",
        "Integración con APIs externas",
        "Tiempo real con WebSockets"
      ]
    },
    {
      id: 5,
      title: "Optimización & SEO",
      subtitle: "Performance & Posicionamiento",
      description: "Auditoría y optimización de sitios existentes. Mejoro velocidad, SEO técnico y experiencia de usuario.",
      icon: "🚀",
      technologies: ["SEO", "Performance", "Analytics", "Core Web Vitals"],
      color: "from-yellow-400 to-orange-500",
      features: [
        "Auditoría técnica completa",
        "Optimización Core Web Vitals",
        "SEO técnico avanzado",
        "Análisis de competencia",
        "Reportes de mejoras"
      ]
    },
    {
      id: 6,
      title: "Migración & Modernización",
      subtitle: "Actualiza tu tecnología",
      description: "Migración de sitios legacy a tecnologías modernas. React, Next.js, performance y seguridad mejorados.",
      icon: "🔄",
      technologies: ["Migration", "Refactoring", "Legacy", "Modern Stack"],
      color: "from-indigo-400 to-purple-500",
      features: [
        "Análisis de código legacy",
        "Plan de migración gradual",
        "Mejora de performance",
        "Actualización de seguridad",
        "Documentación completa"
      ]
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Intentar cargar desde API homepage primero
        const homepageResponse = await fetch('/api/homepage');
        if (homepageResponse.ok) {
          const homepageData = await homepageResponse.json();
          if (homepageData.services && homepageData.services.length > 0) {
            // Remover precios de servicios para esta sección
            const servicesWithoutPrices = homepageData.services.map(service => {
              const { startingPrice, deliveryTime, ...serviceWithoutPrice } = service;
              return serviceWithoutPrice;
            });
            setServices(servicesWithoutPrices);
            setLoading(false);
            return;
          }
        }

        // Fallback: intentar desde API services específica
        const servicesResponse = await fetch('/api/public/services');
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          if (servicesData.services && servicesData.services.length > 0) {
            // Remover precios de servicios para esta sección
            const servicesWithoutPrices = servicesData.services.map(service => {
              const { startingPrice, deliveryTime, ...serviceWithoutPrice } = service;
              return serviceWithoutPrice;
            });
            setServices(servicesWithoutPrices);
            setLoading(false);
            return;
          }
        }

        // Si no hay datos en APIs, usar servicios por defecto
        setServices(defaultServices);
      } catch (err) {
        console.error('Error loading services:', err);
        setError(err.message);
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#0B1120]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded w-96 mx-auto mb-6"></div>
             <div className="h-6 bg-gray-700 rounded w-[600px] mx-auto"></div>
           </div>
         </div>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="animate-pulse">
               <div className="h-96 bg-gray-800 rounded-lg border border-gray-700"></div>
             </div>
           ))}
         </div>
       </div>
     </section>
   );
 }

 if (error) {
   return (
     <section className="py-20 bg-[#0B1120]">
       <div className="container mx-auto px-4 text-center">
         <div className="text-red-400 mb-4">Error cargando servicios: {error}</div>
         <button 
           onClick={() => window.location.reload()} 
           className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded"
         >
           Reintentar
         </button>
       </div>
     </section>
   );
 }

 return (
   <section className="py-20 bg-[#0B1120]">
     <div className="container mx-auto px-4">
       <div className="text-center mb-16">
         <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
           Servicios Profesionales
         </h2>
         <p className="text-xl text-gray-400 max-w-3xl mx-auto">
           Desarrollo web moderno con tecnologías de vanguardia para proyectos que requieren calidad y escalabilidad
         </p>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {services.map((service, index) => (
           <div 
             key={service._id || service.id || index}
             className="relative group cursor-pointer"
           >
             <div className="bg-[#1E293B] rounded-xl p-8 h-full border border-slate-700/50 hover:border-cyan-500/40 transition-all duration-200">
               
               {/* Icon */}
               <div className="text-4xl mb-4">
                 {service.icon}
               </div>

               {/* Title */}
               <h3 className="text-2xl font-bold text-white mb-3">
                 {service.title}
               </h3>

               {/* Subtitle */}
               {service.subtitle && (
                 <p className="text-cyan-400 text-sm font-medium mb-4">
                   {service.subtitle}
                 </p>
               )}

               {/* Description */}
               <p className="text-gray-400 mb-6 leading-relaxed">
                 {service.description}
               </p>

               {/* Features */}
               {service.features && service.features.length > 0 && (
                 <div className="mb-6">
                   <h4 className="text-white font-semibold mb-3">Incluye:</h4>
                   <ul className="space-y-2">
                     {service.features.slice(0, 3).map((feature, featureIndex) => (
                       <li key={featureIndex} className="text-gray-400 text-sm flex items-center">
                         <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-3"></span>
                         {feature}
                       </li>
                     ))}
                     {service.features.length > 3 && (
                       <li className="text-cyan-400 text-sm">
                         +{service.features.length - 3} más características...
                       </li>
                     )}
                   </ul>
                 </div>
               )}

               {/* Technologies */}
               {service.technologies && service.technologies.length > 0 && (
                 <div className="mb-6">
                   <div className="flex flex-wrap gap-2">
                     {service.technologies.slice(0, 4).map((tech, techIndex) => (
                       <span
                         key={techIndex}
                         className="px-3 py-1 text-xs font-mono bg-slate-800 text-cyan-400 rounded border border-slate-700"
                       >
                         {tech}
                       </span>
                     ))}
                     {service.technologies.length > 4 && (
                       <span className="px-2 py-1 text-xs bg-gray-600 text-gray-400 rounded-full">
                         +{service.technologies.length - 4}
                       </span>
                     )}
                   </div>
                 </div>
               )}

               {/* Hover effect overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none"></div>
             </div>
           </div>
         ))}
       </div>

       {/* Call to Action */}
       <div className="text-center mt-16">
         <div className="bg-[#1E293B] rounded-xl p-8 border border-slate-700/50">
           <h3 className="text-2xl font-bold text-white mb-4">
             ¿Necesitas algo específico?
           </h3>
           <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
             Cada proyecto es único. Háblame de tu idea y te haré una propuesta personalizada 
             con tecnologías y funcionalidades específicas para tus necesidades.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link
               href="/contacto"
               className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r bg-cyan-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
             >
               Solicitar Presupuesto
             </Link>
             <Link
               href="/portfolio"
               className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:border-cyan-500 hover:text-cyan-400 transition-colors duration-300"
             >
               Ver Portfolio
             </Link>
           </div>
         </div>
       </div>
     </div>
   </section>
 );
}

export default ServicesGrid;