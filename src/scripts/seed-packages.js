// src/scripts/seed-packages.js
import { config } from 'dotenv';
import mongoose from 'mongoose';

// Cargar variables de entorno
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Esquemas
const packageSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, required: true },
  color: { type: String, default: 'from-cyan-400 to-blue-500' },
  popular: { type: Boolean, default: false },
  features: [String],
  technologies: [String],
  ideal: String,
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['seo', 'features', 'admin', 'integrations', 'mobile', 'support', 'ecommerce'],
    default: 'features'
  },
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
const Addon = mongoose.model('Addon', addonSchema);

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

async function seedPackages() {
  try {
    await connectDB();

    console.log('🚀 Creando paquetes por defecto...');

    // Paquetes
    const packages = [
      {
        slug: 'starter',
        name: 'Starter',
        description: 'Perfecto para freelancers y pequeños negocios',
        price: '1,500€',
        duration: '2-3 semanas',
        color: 'from-cyan-400 to-blue-500',
        popular: false,
        features: [
          'Landing page moderna',
          'Diseño responsive',
          'Formulario de contacto',
          'SEO básico',
          'Analytics integrado',
          '1 mes de soporte'
        ],
        technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
        ideal: 'Freelancers, consultores, pequeños servicios',
        orderIndex: 1
      },
      {
        slug: 'business',
        name: 'Business',
        description: 'Para empresas que buscan una presencia web sólida',
        price: '3,500€',
        duration: '4-6 semanas',
        color: 'from-green-400 to-emerald-500',
        popular: true,
        features: [
          'Sitio web completo (hasta 8 páginas)',
          'Panel de administración',
          'Blog integrado',
          'SEO avanzado',
          'Formularios avanzados',
          'Integración con CRM',
          '3 meses de soporte',
          'Analytics avanzado'
        ],
        technologies: ['Next.js', 'CMS Personalizado', 'APIs', 'MongoDB'],
        ideal: 'Empresas medianas, servicios profesionales',
        orderIndex: 2
      },
      {
        slug: 'enterprise',
        name: 'Enterprise',
        description: 'Soluciones a medida para proyectos complejos',
        price: 'Desde 8,000€',
        duration: '8-12 semanas',
        color: 'from-purple-400 to-pink-500',
        popular: false,
        features: [
          'Aplicación web personalizada',
          'Arquitectura escalable',
          'Integraciones múltiples',
          'Dashboard administrativo',
          'Sistema de usuarios',
          'APIs personalizadas',
          'Testing automatizado',
          '6 meses de soporte',
          'Documentación completa'
        ],
        technologies: ['Full Stack', 'Microservicios', 'CI/CD', 'Seguridad'],
        ideal: 'Startups, empresas tech, proyectos complejos',
        orderIndex: 3
      }
    ];

    for (const pkg of packages) {
      await Package.findOneAndUpdate(
        { slug: pkg.slug },
        pkg,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Paquetes creados');

    // Add-ons
    const addons = [
      { name: 'SEO Avanzado', price: '+800€', description: 'Optimización técnica completa', category: 'seo', orderIndex: 1 },
      { name: 'Multi-idioma', price: '+600€', description: 'Soporte para múltiples idiomas', category: 'features', orderIndex: 1 },
      { name: 'Panel Admin', price: '+1,200€', description: 'CMS personalizado', category: 'admin', orderIndex: 1 },
      { name: 'Integración CRM', price: '+900€', description: 'Conexión con HubSpot/Salesforce', category: 'integrations', orderIndex: 1 },
      { name: 'App Móvil (PWA)', price: '+1,800€', description: 'Versión móvil nativa', category: 'mobile', orderIndex: 1 },
      { name: 'E-commerce Básico', price: '+1,500€', description: 'Tienda online con hasta 50 productos', category: 'ecommerce', orderIndex: 1 },
      { name: 'E-commerce Avanzado', price: '+3,000€', description: 'Tienda completa con gestión avanzada', category: 'ecommerce', orderIndex: 2 },
      { name: 'Soporte 24/7', price: '+200€/mes', description: 'Soporte prioritario', category: 'support', orderIndex: 1 }
    ];

    for (const addon of addons) {
      await Addon.findOneAndUpdate(
        { name: addon.name },
        addon,
        { upsert: true, new: true }
      );
    }
    console.log('✅ Add-ons creados');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

seedPackages();