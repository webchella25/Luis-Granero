// src/app/api/admin/portfolio/settings/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const portfolioSettings = await Page.findOne({ slug: 'portfolio-settings' })
    
    if (!portfolioSettings) {
      // Return default settings
      return NextResponse.json({
        content: {
          hero: {
            title: "Portfolio",
            subtitle: "Casos de éxito que demuestran mi experiencia en desarrollo web moderno",
            description: "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
          },
          stats: {
            clientSatisfaction: "98%",
            avgROI: "300%", 
            avgLoadTime: "1.2s"
          },
          categories: [
            { name: "E-commerce", count: "15+", color: "from-green-400 to-emerald-500" },
            { name: "Aplicaciones Web", count: "20+", color: "from-cyan-400 to-blue-500" },
            { name: "Dashboards", count: "12+", color: "from-purple-400 to-pink-500" },
            { name: "Landing Pages", count: "18+", color: "from-orange-400 to-red-500" }
          ],
          valuePropositions: [
            {
              icon: "🎯",
              title: "Enfoque en conversiones",
              description: "Cada proyecto está optimizado para maximizar ROI y conversiones"
            },
            {
              icon: "⚡", 
              title: "Performance excepcional",
              description: "Velocidad de carga sub-2 segundos y puntuaciones Lighthouse 90+"
            }
          ]
        }
      })
    }
    
    return NextResponse.json(portfolioSettings)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
    
    const portfolioSettings = await Page.findOneAndUpdate(
      { slug: 'portfolio-settings' },
      {
        slug: 'portfolio-settings',
        title: 'Portfolio Settings',
        content: data,
        isPublished: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ 
      message: 'Portfolio settings updated successfully', 
      data: portfolioSettings 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}