// scripts/init-services.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Service from '../src/models/Service.js';

const services = [
  {
    slug: 'desarrollo-web-moderno',
    title: 'Desarrollo Web Moderno',
    subtitle: 'React, Next.js & TypeScript',
    description: 'Aplicaciones web escalables con las últimas tecnologías. Código limpio, documentado y optimizado para rendimiento.',
    icon: '💻',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    color: 'from-cyan-400 to-blue-500',
    features: [
      'Single Page Applications (SPA)',
      'Server Side Rendering (SSR)',
      'Progressive Web Apps (PWA)',
      'Optimización SEO técnico',
      'Performance 90+ en Lighthouse'
    ],
    orderIndex: 1,
    isActive: true
  },
  {
    slug: 'ecommerce-personalizado',
    title: 'E-commerce Personalizado',
    subtitle: 'Tiendas online sin límites',
    description: 'Plataformas de comercio electrónico a medida con integración de pagos, gestión de inventario y analytics avanzados.',
    icon: '🛒',
    technologies: ['E-commerce', 'Stripe', 'PayPal', 'Analytics'],
    color: 'from-green-400 to-emerald-500',
    features: [
      'Integración de pagos múltiples',
      'Dashboard de administración',
      'Gestión de inventario',
      'Analytics y reportes',
      'Optimización conversiones'
    ],
    orderIndex: 2,
    isActive: true
  },
  {
    slug: 'apis-backend',
    title: 'APIs & Backend',
    subtitle: 'Arquitecturas escalables',
    description: 'Desarrollo de APIs REST y GraphQL, microservicios y arquitecturas backend robustas para aplicaciones complejas.',
    icon: '⚙️',
    technologies: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
    color: 'from-purple-400 to-pink-500',
    features: [
      'APIs REST y GraphQL',
      'Autenticación JWT',
      'Base de datos optimizada',
      'Documentación automática',
      'Testing automatizado'
    ],
    orderIndex: 3,
    isActive: true
  },
  {
    slug: 'aplicaciones-web-complejas',
    title: 'Aplicaciones Web Complejas',
    subtitle: 'Dashboards & Sistemas',
    description: 'Sistemas de gestión, CRM, dashboards analíticos y aplicaciones empresariales con múltiples roles de usuario.',
    icon: '📊',
    technologies: ['React', 'Chart.js', 'D3.js', 'Real-time'],
    color: 'from-orange-400 to-red-500',
    features: [
      'Dashboards interactivos',
      'Múltiples roles de usuario',
      'Reportes avanzados',
      'Integración con APIs externas',
      'Tiempo real con WebSockets'
    ],
    orderIndex: 4,
    isActive: true
  },
  {
    slug: 'optimizacion-seo',
    title: 'Optimización & SEO',
    subtitle: 'Performance & Posicionamiento',
    description: 'Auditoría y optimización de sitios existentes. Mejoro velocidad, SEO técnico y experiencia de usuario.',
    icon: '🚀',
    technologies: ['SEO', 'Performance', 'Analytics', 'Core Web Vitals'],
    color: 'from-yellow-400 to-orange-500',
    features: [
      'Auditoría técnica completa',
      'Optimización Core Web Vitals',
      'SEO técnico avanzado',
      'Análisis de competencia',
      'Reportes de mejoras'
    ],
    orderIndex: 5,
    isActive: true
  },
  {
    slug: 'migracion-modernizacion',
    title: 'Migración & Modernización',
    subtitle: 'Actualiza tu tecnología',
    description: 'Migración de sitios legacy a tecnologías modernas. React, Next.js, performance y seguridad mejorados.',
    icon: '🔄',
    technologies: ['Migration', 'Refactoring', 'Legacy', 'Modern Stack'],
    color: 'from-indigo-400 to-purple-500',
    features: [
      'Análisis de código legacy',
      'Plan de migración gradual',
      'Mejora de performance',
      'Actualización de seguridad',
      'Documentación completa'
    ],
    orderIndex: 6,
    isActive: true
  }
];

async function initServices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📦 Inicializando servicios...');
    const existingServices = await Service.find();

    if (existingServices.length === 0) {
      await Service.insertMany(services);
      console.log(`✅ ${services.length} servicios creados`);
    } else {
      console.log(`ℹ️  Ya existen ${existingServices.length} servicios`);
      console.log('¿Quieres actualizar? Borra los servicios existentes primero.');
    }

    console.log('\n✅ Servicios inicializados correctamente');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initServices();
