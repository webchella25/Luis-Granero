// scripts/migrate-to-mongodb.js
import connectDB from '../src/lib/mongodb.js';
import { homepageSchema } from '../src/lib/pageData.js';

// Importar todos los modelos
import User from '../src/models/User.js';
import SiteConfig from '../src/models/SiteConfig.js';
import Service from '../src/models/Service.js';
import Project from '../src/models/Project.js';
import TechStack from '../src/models/TechStack.js';
import Testimonial from '../src/models/Testimonial.js';
import BlogPost from '../src/models/BlogPost.js';
import FAQ from '../src/models/FAQ.js';

async function migrateData() {
  try {
    await connectDB();
    console.log('📦 Conectado a MongoDB');

    // 1. Crear usuario administrador
    const adminUser = await User.create({
      username: 'luisgranero',
      email: 'hola@luisgranero.com',
      password: 'tu_password_seguro', // Se hasheará automáticamente
      role: 'admin',
      profile: {
        firstName: 'Luis',
        lastName: 'Granero',
        bio: 'Desarrollador Full Stack especializado en React y Next.js'
      }
    });
    console.log('✅ Usuario admin creado');

    // 2. Configuración del sitio
    const siteConfigs = [
      { key: 'site_title', value: 'Luis Granero - Desarrollador Full Stack', category: 'general' },
      { key: 'site_description', value: 'Desarrollador Full Stack especializado en React, Next.js y soluciones web personalizadas', category: 'seo' },
      { key: 'hero_title', value: 'Luis Granero', category: 'homepage' },
      { key: 'hero_subtitle', value: 'Desarrollador Full Stack', category: 'homepage' },
      { key: 'hero_description', value: 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.', category: 'homepage' },
      { key: 'contact_email', value: 'hola@luisgranero.com', category: 'contact' },
      { key: 'contact_phone', value: '+34 XXX XXX XXX', category: 'contact' },
      { key: 'hero_stats', value: [
        { label: "Proyectos", value: "50+" },
        { label: "Años", value: "10+" },
        { label: "Clientes", value: "35+" },
        { label: "Tecnologías", value: "15+" }
      ], category: 'homepage', type: 'array' }
    ];

    await SiteConfig.insertMany(siteConfigs);
    console.log('✅ Configuración del sitio creada');

    // 3. Servicios
    const services = [
      {
        slug: 'desarrollo-web',
        title: 'Desarrollo Web Moderno',
        subtitle: 'React, Next.js, TypeScript',
        description: 'Aplicaciones web de última generación con tecnologías modernas. Código limpio, escalable y mantenible.',
        icon: '💻',
        color: 'from-cyan-400 to-blue-500',
        features: [
          'React 18+ con Hooks avanzados',
          'Next.js 14 con App Router',
          'TypeScript para type safety',
          'Responsive design nativo',
          'Performance optimizada',
          'SEO técnico integrado'
        ],
        technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
        examples: [
          'Landing pages corporativas',
          'Portales web empresariales',
          'Aplicaciones SPA complejas'
        ],
        pricing: {
          startingPrice: '1,500€',
          priceRange: { min: 1500, max: 5000 }
        },
        deliveryTime: '2-4 semanas',
        orderIndex: 1
      },
      {
        slug: 'ecommerce',
        title: 'E-commerce Personalizado',
        subtitle: 'Sin plantillas, máximo rendimiento',
        description: 'Tiendas online a medida con gestión avanzada, múltiples pasarelas de pago y panel administrativo completo.',
        icon: '🛒',
        color: 'from-green-400 to-emerald-500',
        features: [
          'Catálogo de productos avanzado',
          'Gestión de inventarios',
          'Múltiples métodos de pago',
          'Panel de administración',
          'Analytics e informes',
          'Integración con ERP/CRM'
        ],
        technologies: ['Next.js', 'Stripe', 'MongoDB', 'APIs'],
        examples: [
          'Tiendas de moda y lifestyle',
          'E-commerce B2B',
          'Marketplaces especializados'
        ],
        pricing: {
          startingPrice: '3,500€',
          priceRange: { min: 3500, max: 15000 }
        },
        deliveryTime: '4-8 semanas',
        orderIndex: 2
      },
      // ... más servicios
    ];

    await Service.insertMany(services);
    console.log('✅ Servicios creados');

    // 4. Tech Stack
    const techStackItems = [
      { name: 'React', level: 95, color: '#61DAFB', category: 'frontend', orderIndex: 1 },
      { name: 'Next.js', level: 90, color: '#000000', category: 'frontend', orderIndex: 2 },
      { name: 'TypeScript', level: 85, color: '#3178C6', category: 'frontend', orderIndex: 3 },
      { name: 'Tailwind CSS', level: 90, color: '#06B6D4', category: 'frontend', orderIndex: 4 },
      { name: 'Node.js', level: 80, color: '#339933', category: 'backend', orderIndex: 5 },
      { name: 'MongoDB', level: 75, color: '#47A248', category: 'database', orderIndex: 6 },
      { name: 'Git', level: 90, color: '#F05032', category: 'tools', orderIndex: 7 },
      { name: 'Docker', level: 65, color: '#2496ED', category: 'tools', orderIndex: 8 }
    ];

    await TechStack.insertMany(techStackItems);
    console.log('✅ Tech Stack creado');

    // 5. Proyectos destacados
    const projects = [
      {
        slug: 'ecommerce-fashion-store',
        title: 'E-commerce Fashion Store',
        subtitle: 'Tienda online de moda avanzada',
        description: 'Tienda online de moda con gestión avanzada de inventarios, múltiples métodos de pago y dashboard administrativo completo.',
        image: '🛍️',
        category: 'ecommerce',
        technologies: ['Next.js', 'TypeScript', 'Stripe', 'MongoDB', 'Tailwind'],
        features: [
          'Catálogo de productos con filtros avanzados',
          'Carrito de compras persistente',
          'Integración con Stripe y PayPal',
          'Panel administrativo completo',
          'Sistema de inventarios en tiempo real',
          'SEO optimizado para productos'
        ],
        metrics: [
          { key: 'performance', value: '98/100', label: 'Performance' },
          { key: 'conversions', value: '+45%', label: 'Conversiones' },
          { key: 'loadTime', value: '1.1s', label: 'Tiempo de carga' },
          { key: 'revenue', value: '+180%', label: 'Ingresos' }
        ],
        year: 2024,
        status: 'En producción',
        isFeatured: true,
        orderIndex: 1,
        results: 'Incremento del 180% en ventas online durante los primeros 6 meses.',
        challenges: ['Optimización de carga de imágenes', 'Gestión de inventarios en tiempo real', 'Integración con múltiples pasarelas de pago'],
        learnings: ['Implementación de lazy loading efectivo', 'Arquitectura escalable para e-commerce', 'UX optimizada para conversiones']
      },
      // ... más proyectos
    ];

    await Project.insertMany(projects);
    console.log('✅ Proyectos creados');

    // 6. Testimonios
    const testimonials = [
      {
        client: {
          name: 'María González',
          company: 'StartupTech',
          role: 'CEO'
        },
        content: 'Luis transformó nuestra idea en una plataforma increíble. El resultado superó nuestras expectativas y los tiempos de entrega fueron impecables.',
        rating: 5,
        project: {
          name: 'Plataforma SaaS',
          category: 'webapp'
        },
        metrics: [
          { key: 'performance', value: '+40%', label: 'Performance' },
          { key: 'conversions', value: '+60%', label: 'Conversiones' },
          { key: 'loadTime', value: '1.1s', label: 'Tiempo de carga' }
        ],
        isFeatured: true,
        orderIndex: 1,
        verificationStatus: 'verified'
      },
      // ... más testimonios
    ];

    await Testimonial.insertMany(testimonials);
    console.log('✅ Testimonios creados');

    // 7. FAQs
    const faqs = [
      {
        category: 'General',
        question: '¿Por qué elegir desarrollo personalizado en lugar de WordPress?',
        answer: 'El desarrollo personalizado ofrece performance superior, escalabilidad garantizada, seguridad mejorada y código optimizado. Mientras WordPress puede ser más rápido inicialmente, el desarrollo a medida te da control total, mejor SEO técnico y una base sólida para crecer sin limitaciones de plugins o temas.',
        tags: ['desarrollo', 'wordpress', 'personalizado'],
        orderIndex: 1
      },
      // ... más FAQs
    ];

    await FAQ.insertMany(faqs);
    console.log('✅ FAQs creadas');

    console.log('🎉 ¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

// Ejecutar migración
migrateData();