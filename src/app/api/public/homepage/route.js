// src/app/api/public/homepage/route.js - SOLO PARA API
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const homepage = await Page.findOne({ 
      slug: 'homepage', 
      isPublished: true 
    }).select('content updatedAt')
    
    if (!homepage) {
      // Datos por defecto si no existe en BD
      return NextResponse.json({ 
        content: {
          hero: {
            title: "Luis Granero - Desarrollador Web Freelance",
            subtitle: "Especializado en React, Next.js y soluciones personalizadas",
            description: "Transformo ideas en aplicaciones web modernas y exitosas",
            ctaText: "Ver mi trabajo",
            ctaLink: "/portfolio"
          },
          services: [
            {
              id: 1,
              icon: "⚛️",
              title: "Desarrollo React & Next.js",
              description: "Aplicaciones web modernas y optimizadas",
              features: ["SSR/SSG", "Performance", "SEO"],
              technologies: ["React", "Next.js", "TypeScript"],
              color: "from-cyan-400 to-blue-500"
            }
          ]
        }
      })
    }
    
    return NextResponse.json(homepage, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching homepage:', error)
    return NextResponse.json({ 
      content: {
        hero: {
          title: "Luis Granero",
          subtitle: "Desarrollador Web Freelance"
        }
      }
    })
  }
}