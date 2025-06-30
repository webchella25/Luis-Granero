// scripts/migrate-to-mongodb.js
import { config } from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definido en .env.local');
  console.log('Variables disponibles:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  process.exit(1);
}

console.log('🔗 Conectando a MongoDB...');
console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Ocultar credenciales

// Conectar directamente con mongoose (SIN importar el archivo de Next.js)
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('📦 Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Esquemas
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  profile: {
    firstName: String,
    lastName: String,
    bio: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const configSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: String,
  type: { type: String, default: 'string' },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  title: String,
  subtitle: String,
  description: String,
  icon: String,
  color: String,
  features: [String],
  technologies: [String],
  examples: [String],
  pricing: {
    startingPrice: String,
    priceRange: { min: Number, max: Number }
  },
  deliveryTime: String,
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  stats: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 }
  }
}, { timestamps: true });

const techStackSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  level: { type: Number, min: 0, max: 100 },
  color: String,
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'tools', 'mobile', 'design']
  },
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Modelos
const User = mongoose.model('User', userSchema);
const SiteConfig = mongoose.model('SiteConfig', configSchema);
const Service = mongoose.model('Service', serviceSchema);
const TechStack = mongoose.model('TechStack', techStackSchema);

async function migrateData() {
  try {
    await connectDB();

    console.log('🚀 Iniciando migración de datos...');

    // 1. Usuario admin
    const adminEmail = process.env.ADMIN_EMAIL || 'luis@luisgranero.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLuis2025!';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        username: 'luisgranero',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        profile: {
          firstName: 'Luis',
          lastName: 'Granero',
          bio: 'Desarrollador Full Stack especializado en React y Next.js'
        }
      });
      console.log('✅ Usuario admin creado');
    } else {
      console.log('ℹ️ Usuario admin ya existe');
    }

    // 2. Configuración del sitio
    const configs = [
      { key: 'site_title', value: 'Luis Granero - Desarrollador Full Stack', category: 'general' },
      { key: 'site_description', value: 'Desarrollador Full Stack especializado en React, Next.js y soluciones web personalizadas', category: 'seo' },
      { key: 'hero_title', value: 'Luis Granero', category: 'homepage' },
      { key: 'hero_subtitle', value: 'Desarrollador Full Stack', category: 'homepage' },
      { key: 'hero_description', value: 'Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.', category: 'homepage' },
      { key: 'hero_cta_text', value: 'Ver mis proyectos', category: 'homepage' },
      { key: 'hero_cta_link', value: '/portfolio', category: 'homepage' },
      { key: 'contact_email', value: adminEmail, category: 'contact' },
      { key: 'contact_phone', value: '+34 XXX XXX XXX', category: 'contact' },
      { key: 'contact_location', value: 'España', category: 'contact' },
      { key: 'availability', value: 'Disponible para nuevos proyectos', category: 'contact' },
      { key: 'response_time', value: '24 horas', category: 'contact' }
    ];

    for (const config of configs) {
      await SiteConfig.findOneAndUpdate(
        { key: config.key },
        config,
        { upsert: true, new: true }
      );
    }
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
        features: ['React 18+ con Hooks avanzados', 'Next.js 14 con App Router', 'TypeScript para type safety', 'Responsive design nativo', 'Performance optimizada', 'SEO técnico integrado'],
        technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
        examples: ['Landing pages corporativas', 'Portales web empresariales', 'Aplicaciones SPA complejas'],
        pricing: { startingPrice: '1,500€', priceRange: { min: 1500, max: 5000 } },
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
        features: ['Catálogo de productos avanzado', 'Gestión de inventarios', 'Múltiples métodos de pago', 'Panel de administración', 'Analytics e informes', 'Integración con ERP/CRM'],
        technologies: ['Next.js', 'Stripe', 'MongoDB', 'APIs'],
        examples: ['Tiendas de moda y lifestyle', 'E-commerce B2B', 'Marketplaces especializados'],
        pricing: { startingPrice: '3,500€', priceRange: { min: 3500, max: 15000 } },
        deliveryTime: '4-8 semanas',
        orderIndex: 2
      },
      {
        slug: 'aplicaciones-web',
        title: 'Aplicaciones Web Personalizadas',
        subtitle: 'SPA, PWA, Dashboards',
        description: 'Herramientas web específicas para tu negocio. Desde dashboards corporativos hasta aplicaciones de gestión.',
        icon: '⚡',
        color: 'from-purple-400 to-pink-500',
        features: ['Dashboards interactivos', 'Progressive Web Apps', 'Gestión de usuarios', 'Reportes en tiempo real', 'Integraciones API', 'Workflow automatizado'],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Charts'],
        examples: ['CRM personalizado', 'Sistema de reservas', 'Plataforma educativa'],
        pricing: { startingPrice: '2,500€', priceRange: { min: 2500, max: 8000 } },
        deliveryTime: '3-6 semanas',
        orderIndex: 3
      },
      {
        slug: 'apis-backend',
        title: 'APIs y Backend',
        subtitle: 'Node.js, Bases de datos, Integración',
        description: 'Desarrollo de APIs robustas y backends escalables. Integración con servicios externos y bases de datos optimizadas.',
        icon: '🔧',
        color: 'from-orange-400 to-red-500',
        features: ['APIs REST documentadas', 'Autenticación y autorización', 'Base de datos optimizada', 'Integración con terceros', 'Monitoreo y logs', 'Escalabilidad automática'],
        technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        examples: ['API para mobile app', 'Microservicios', 'Integración con CRM'],
        pricing: { startingPrice: '1,800€', priceRange: { min: 1800, max: 6000 } },
        deliveryTime: '2-5 semanas',
        orderIndex: 4
      },
      {
        slug: 'seo-optimizacion',
        title: 'SEO Técnico y Optimización',
        subtitle: 'Performance, Core Web Vitals, Rankings',
        description: 'Optimización técnica completa para mejorar rankings y experiencia de usuario. Análisis profundo y mejoras medibles.',
        icon: '📈',
        color: 'from-indigo-400 to-purple-500',
        features: ['Auditoría técnica completa', 'Optimización de velocidad', 'Core Web Vitals', 'Estructura de datos', 'Meta tags avanzados', 'Monitoreo continuo'],
        technologies: ['Lighthouse', 'GTM', 'Analytics', 'Search Console'],
        examples: ['Auditoría web completa', 'Optimización de performance', 'Estrategia SEO técnico'],
        pricing: { startingPrice: '800€', priceRange: { min: 800, max: 2000 } },
        deliveryTime: '1-2 semanas',
        orderIndex: 5
      }
    ];

    for (const service of services) {
      await Service.findOneAndUpdate(
        { slug: service.slug },
        service,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Servicios creados');

    // 4. Tech Stack
    const techStackItems = [
      { name: 'React', level: 95, color: '#61DAFB', category: 'frontend', orderIndex: 1 },
      { name: 'Next.js', level: 90, color: '#000000', category: 'frontend', orderIndex: 2 },
      { name: 'TypeScript', level: 85, color: '#3178C6', category: 'frontend', orderIndex: 3 },
      { name: 'Tailwind CSS', level: 90, color: '#06B6D4', category: 'frontend', orderIndex: 4 },
      { name: 'Node.js', level: 80, color: '#339933', category: 'backend', orderIndex: 5 },
      { name: 'Express', level: 75, color: '#000000', category: 'backend', orderIndex: 6 },
      { name: 'MongoDB', level: 75, color: '#47A248', category: 'database', orderIndex: 7 },
      { name: 'PostgreSQL', level: 70, color: '#336791', category: 'database', orderIndex: 8 },
      { name: 'Python', level: 70, color: '#3776AB', category: 'backend', orderIndex: 9 },
      { name: 'Docker', level: 65, color: '#2496ED', category: 'tools', orderIndex: 10 },
      { name: 'Git', level: 90, color: '#F05032', category: 'tools', orderIndex: 11 },
      { name: 'Vercel', level: 85, color: '#000000', category: 'tools', orderIndex: 12 }
    ];

    for (const tech of techStackItems) {
      await TechStack.findOneAndUpdate(
        { name: tech.name },
        tech,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Tech Stack creado');

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log(`📧 Admin: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateData();