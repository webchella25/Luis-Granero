// src/app/api/admin/homepage/route.js - VERSIÓN COMPLETA
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'

// Modelo simple de Page si no existe
let Page
try {
  Page = require('@/models/Page').default
} catch {
  const mongoose = require('mongoose')
  
  const pageSchema = new mongoose.Schema({
    slug: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  })

  Page = mongoose.models.Page || mongoose.model('Page', pageSchema)
}

export async function GET() {
  try {
    await connectDB()
    
    const homepage = await Page.findOne({ slug: 'homepage' })
    
    if (!homepage) {
      return NextResponse.json({ 
        content: getDefaultHomepageData() 
      })
    }
    
    return NextResponse.json(homepage)
  } catch (error) {
    console.error('Error fetching homepage:', error)
    return NextResponse.json({ 
      content: getDefaultHomepageData() 
    })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const data = await request.json()
    
    // Validar datos básicos
    if (!data.hero || !data.hero.title) {
      return NextResponse.json({ error: 'Hero title is required' }, { status: 400 })
    }
    
    const homepage = await Page.findOneAndUpdate(
      { slug: 'homepage' },
      {
        slug: 'homepage',
        title: 'Homepage',
        content: data,
        seo: {
          metaTitle: data.hero?.title || 'Luis Granero - Desarrollador Web',
          metaDescription: data.hero?.description || 'Desarrollador web freelance especializado en React y Next.js',
          keywords: [
            'desarrollador web',
            'react',
            'next.js',
            'freelance',
            'javascript',
            'typescript',
            data.hero?.title?.toLowerCase(),
            ...(data.about?.highlights || []).map(h => h.toLowerCase())
          ].filter(Boolean)
        },
        isPublished: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ 
      message: 'Homepage updated successfully', 
      data: homepage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error saving homepage:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

function getDefaultHomepageData() {
  return {
    hero: {
      title: "Luis Granero",
      subtitle: "Desarrollador Full Stack",
      description: "Transformo ideas en aplicaciones web modernas y soluciones personalizadas. Especializado en React, Next.js y arquitecturas escalables.",
      ctaText: "Ver mis proyectos",
      ctaLink: "/portfolio",
      backgroundVideo: "",
      image: ""
    },
    about: {
      title: "Sobre Mí",
      subtitle: "Desarrollador apasionado por crear soluciones web innovadoras",
      description: "Con más de 10 años de experiencia en desarrollo web, me especializo en crear aplicaciones modernas, escalables y de alto rendimiento.",
      highlights: [
        "10+ años de experiencia",
        "50+ proyectos completados",
        "Especialista en React/Next.js",
        "Enfoque en performance"
      ],
      image: "",
      skills: [
        { name: "React/Next.js", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Node.js", level: 85 },
        { name: "MongoDB", level: 80 }
      ],
      experience: [
        {
          company: "Freelance",
          role: "Desarrollador Full Stack",
          period: "2020 - Presente",
          description: "Desarrollo de aplicaciones web personalizadas para startups y empresas."
        }
      ]
    },
    stats: [
      { label: "Proyectos", value: "50+", icon: "🚀" },
      { label: "Años", value: "10+", icon: "📅" },
      { label: "Clientes", value: "35+", icon: "👥" },
      { label: "Tecnologías", value: "15+", icon: "⚡" }
    ],
    services: [],
    testimonials: [
      {
        id: 1,
        name: "María González",
        company: "TechStartup",
        role: "CEO",
        content: "Luis transformó completamente nuestro e-commerce. El resultado superó todas nuestras expectativas.",
        rating: 5,
        image: "",
        project: "E-commerce Platform",
        date: "2024-01-15"
      }
    ],
    cta: {
      title: "¿Listo para llevar tu proyecto al siguiente nivel?",
      subtitle: "Trabajemos juntos para crear algo increíble",
      description: "Con más de 10 años de experiencia, puedo ayudarte a transformar tu idea en una aplicación web exitosa.",
      primaryButton: {
        text: "Iniciar Proyecto",
        link: "/contacto",
        style: "primary"
      },
      secondaryButton: {
        text: "Ver Portfolio",
        link: "/portfolio",
        style: "secondary"
      },
      backgroundStyle: "gradient",
      backgroundImage: "",
      backgroundColor: "#1F2937",
      showContactInfo: true,
      contactInfo: {
        email: "luis@luisgranero.com",
        phone: "+34 123 456 789",
        calendly: "https://calendly.com/luisgranero"
      },
      features: [
        "Consulta inicial gratuita",
        "Desarrollo personalizado",
        "Soporte post-lanzamiento",
        "Garantía de satisfacción"
      ],
      urgency: {
        enabled: false,
        text: "¡Solo quedan 3 slots para este mes!",
        countdown: false,
        date: ""
      }
    }
  }
}