import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactPage from '@/models/ContactPage';

export async function GET() {
  try {
    await connectDB();
    
    let contactPage = await ContactPage.findOne();
    
    if (!contactPage) {
      contactPage = await ContactPage.create({
        hero: {
          title: '¿Listo para llevar tu proyecto al siguiente nivel?',
          subtitle: 'Hablemos de tu idea',
          description: 'Cuéntame tu proyecto y te ayudaré a convertirlo en realidad.'
        },
        contactInfo: {
          email: 'luis@luisgranero.com',
          phone: '+34 698 38 3610',
          location: 'Valencia, España',
          availability: 'Disponible para nuevos proyectos',
          responseTime: '24-48 horas'
        },
        socialLinks: [
          { platform: 'GitHub', url: 'https://github.com/luisgranero', icon: 'github' },
          { platform: 'LinkedIn', url: 'https://linkedin.com/in/luisgranero', icon: 'linkedin' }
        ],
        budgetCalculator: {
          enabled: true,
          title: 'Calculadora de Presupuesto',
          subtitle: 'Obtén una estimación instantánea',
          projectTypes: [
            { id: 'landing', name: 'Landing Page', basePrice: 800, description: 'Página única optimizada', icon: 'file-text', order: 1 },
            { id: 'web-corporativa', name: 'Web Corporativa', basePrice: 1500, description: 'Sitio completo', icon: 'briefcase', order: 2 },
            { id: 'ecommerce', name: 'E-commerce', basePrice: 3000, description: 'Tienda online', icon: 'shopping-cart', order: 3 },
            { id: 'web-app', name: 'Aplicación Web', basePrice: 4000, description: 'SPA/PWA personalizada', icon: 'code', order: 4 }
          ],
          features: [
            { id: 'responsive', name: 'Diseño Responsive', price: 0, description: 'Incluido', category: 'frontend', order: 1 },
            { id: 'animations', name: 'Animaciones', price: 300, description: 'Framer Motion', category: 'frontend', order: 2 },
            { id: 'dark-mode', name: 'Dark Mode', price: 200, description: 'Tema oscuro', category: 'frontend', order: 3 },
            { id: 'auth', name: 'Autenticación', price: 600, description: 'Login/Registro', category: 'backend', order: 4 },
            { id: 'cms', name: 'Panel Admin', price: 800, description: 'CMS personalizado', category: 'backend', order: 5 },
            { id: 'seo-advanced', name: 'SEO Avanzado', price: 500, description: 'Schema markup', category: 'seo', order: 6 }
          ],
          timelines: [
            { id: 'flexible', name: 'Flexible (4-6 semanas)', multiplier: 0.9, days: 35, description: 'Sin urgencia', order: 1 },
            { id: 'normal', name: 'Normal (2-3 semanas)', multiplier: 1.0, days: 18, description: 'Estándar', order: 2 },
            { id: 'urgente', name: 'Urgente (1 semana)', multiplier: 1.5, days: 7, description: 'Prioridad máxima', order: 3 }
          ],
          discounts: [
            { id: 'first-project', name: 'Primer Proyecto', percentage: 10, minAmount: 1000, description: 'Nuevos clientes', enabled: true },
            { id: 'large-project', name: 'Proyecto Grande', percentage: 15, minAmount: 5000, description: 'Proyectos +5000€', enabled: true }
          ]
        },
        seo: {
          title: 'Contacto - Luis Granero',
          description: 'Hablemos de tu proyecto web',
          keywords: ['contacto', 'presupuesto web', 'freelance']
        }
      });
    }
    
    return NextResponse.json(contactPage);
    
  } catch (error) {
    console.error('Error fetching contact page:', error);
    return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    let contactPage = await ContactPage.findOne();
    
    if (!contactPage) {
      contactPage = new ContactPage(body);
    } else {
      Object.assign(contactPage, body);
    }
    
    await contactPage.save();
    
    return NextResponse.json({
      success: true,
      message: 'Actualizado correctamente',
      data: contactPage
    });
    
  } catch (error) {
    console.error('Error updating:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}