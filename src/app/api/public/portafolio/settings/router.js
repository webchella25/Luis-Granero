// src/app/api/public/portfolio/settings/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'
import Project from '@/models/Project'

export async function GET() {
  try {
    await dbConnect()
    
    // Obtener configuración del portfolio
    const portfolioSettings = await Page.findOne({ 
      slug: 'portfolio-settings', 
      isPublished: true 
    }).select('content updatedAt')

    // Obtener estadísticas reales de proyectos
    const totalProjects = await Project.countDocuments({ isPublished: true })
    const featuredProjects = await Project.countDocuments({ isPublished: true, isFeatured: true })
    
    // Obtener tecnologías únicas
    const projects = await Project.find({ isPublished: true }).select('technologies')
    const uniqueTechnologies = new Set()
    projects.forEach(project => {
      project.technologies?.forEach(tech => uniqueTechnologies.add(tech))
    })
    
    const defaultData = {
      hero: {
        title: "Portfolio",
        subtitle: "Casos de éxito que demuestran mi experiencia en desarrollo web moderno", 
        description: "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
      },
      stats: {
        totalProjects,
        featuredProjects,
        technologies: uniqueTechnologies.size,
        yearsExperience: 10,
        clientSatisfaction: "98%",
        avgROI: "300%",
        avgLoadTime: "1.2s"
      }
    }
    
    if (!portfolioSettings) {
      return NextResponse.json({ content: defaultData })
    }
    
    // Combinar configuración personalizada con stats reales
    const responseData = {
      ...portfolioSettings.content,
      stats: {
        ...portfolioSettings.content.stats,
        totalProjects,
        featuredProjects,
        technologies: uniqueTechnologies.size
      }
    }
    
    return NextResponse.json({ content: responseData }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching portfolio settings:', error)
    return NextResponse.json({ content: {} })
  }
}