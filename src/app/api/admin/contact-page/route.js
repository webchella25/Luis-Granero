// src/app/api/admin/contact-page/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import ContactPage from '@/models/ContactPage'

export async function GET() {
  try {
    await dbConnect()
    
    let contactPage = await ContactPage.findOne()
    
    if (!contactPage) {
      // Crear página por defecto
      contactPage = new ContactPage({
        hero: {
          title: "Hablemos de tu proyecto",
          subtitle: "¿Tienes una idea increíble?",
          description: "Cuéntame tu proyecto y te ayudo a hacerlo realidad con desarrollo web personalizado."
        },
        contactMethods: [
          {
            icon: "💬",
            title: "Consulta Gratuita",
            description: "30 minutos para analizar tu proyecto sin compromiso",
            action: "Agendar llamada",
            link: "#",
            highlight: true
          },
          {
            icon: "💻",
            title: "Presupuesto Express",
            description: "Calculadora automática para proyectos estándar",
            action: "Calcular precio",
            link: "#calculadora",
            highlight: false
          },
          {
            icon: "📧",
            title: "Contacto Directo",
            description: "Escríbeme directamente con los detalles",
            action: "Enviar mensaje",
            link: "#formulario",
            highlight: false
          }
        ],
        calculator: {
          enabled: true,
          title: "Calculadora de Presupuestos",
          description: "Obtén una estimación instantánea para tu proyecto",
          services: [
            {
              name: "Landing Page",
              basePrice: 1500,
              priceRange: { min: 1200, max: 2500 },
              options: [
                { name: "Diseño básico", price: 0, description: "Plantilla adaptada" },
                { name: "Diseño personalizado", price: 500, description: "Diseño único" },
                { name: "Animaciones", price: 300, description: "Efectos y transiciones" }
              ]
            },
            {
              name: "E-commerce",
              basePrice: 3500,
              priceRange: { min: 3000, max: 8000 },
              options: [
                { name: "Hasta 50 productos", price: 0, description: "Catálogo básico" },
                { name: "Hasta 500 productos", price: 1000, description: "Catálogo medio" },
                { name: "Productos ilimitados", price: 2000, description: "Catálogo grande" },
                { name: "Multiple warehouses", price: 1500, description: "Gestión avanzada" }
              ]
            },
            {
              name: "Aplicación Web",
              basePrice: 4500,
              priceRange: { min: 4000, max: 12000 },
              options: [
                { name: "Dashboard básico", price: 0, description: "Funcionalidades core" },
                { name: "Dashboard avanzado", price: 2000, description: "Analytics y reportes" },
                { name: "API integrations", price: 1500, description: "Servicios externos" },
                { name: "User management", price: 1000, description: "Roles y permisos" }
              ]
            }
          ],
          addons: [
            { name: "SEO Avanzado", price: 800, description: "Optimización técnica completa", category: "seo" },
            { name: "Multiidioma", price: 600, description: "Soporte para varios idiomas", category: "features" },
            { name: "Panel Admin", price: 1200, description: "CMS personalizado", category: "admin" },
            { name: "Integración CRM", price: 900, description: "Conexión con HubSpot/Salesforce", category: "integrations" },
            { name: "App Móvil (PWA)", price: 1800, description: "Versión móvil nativa", category: "mobile" },
            { name: "Soporte 24/7", price: 200, description: "Por mes", category: "support" }
          ],
          multipliers: [
            { name: "Urgente (entrega en 2 semanas)", factor: 1.5, description: "50% extra" },
            { name: "Premium support (6 meses)", factor: 1.2, description: "20% extra" },
            { name: "Código fuente + docs", factor: 1.1, description: "10% extra" }
          ]
        },
        contactInfo: {
          email: "hola@luisgranero.com",
          phone: "+34 XXX XXX XXX",
          location: "España",
          availability: "Disponible para nuevos proyectos",
          responseTime: "24 horas",
          languages: ["Español", "Inglés"]
        }
      })
      
      await contactPage.save()
    }
    
    return NextResponse.json({ contactPage })
  } catch (error) {
    console.error('Error fetching contact page:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    
    let contactPage = await ContactPage.findOne()
    
    if (contactPage) {
      // Actualizar existente
      Object.assign(contactPage, data)
      await contactPage.save()
    } else {
      // Crear nuevo
      contactPage = new ContactPage(data)
      await contactPage.save()
    }
    
    return NextResponse.json({ 
      message: 'Contact page updated successfully', 
      contactPage 
    })
  } catch (error) {
    console.error('Error saving contact page:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}