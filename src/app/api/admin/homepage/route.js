// src/app/api/admin/homepage/route.js - VERSIÓN SIMPLIFICADA
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

function getDefaultHomepageData() {
  return {
    hero: {
      title: 'Luis Granero - Desarrollador Web',
      subtitle: 'Desarrollador Full Stack especializado en React, Next.js y TypeScript',
      description: 'Creo aplicaciones web modernas, rápidas y escalables',
      ctaText: 'Ver proyectos',
      ctaLink: '/portfolio',
      secondaryCtaText: 'Contactar',
      secondaryCtaLink: '/contacto'
    },
    services: {
      title: 'Servicios',
      subtitle: 'Lo que puedo hacer por ti',
      items: []
    },
    portfolio: {
      title: 'Proyectos destacados',
      subtitle: 'Algunos de mis trabajos recientes',
      featured: []
    },
    testimonials: {
      title: 'Testimonios',
      subtitle: 'Lo que dicen mis clientes',
      items: []
    }
  }
}

export async function GET() {
  try {
    await dbConnect()
    
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
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    
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
          metaDescription: data.hero?.description || 'Desarrollador web freelance',
          keywords: ['desarrollador web', 'freelance', 'react', 'nextjs']
        },
        isPublished: true
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      homepage 
    })
  } catch (error) {
    console.error('Error updating homepage:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  return POST(request)
}