import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';
import Project from '@/models/Project';

export async function GET() {
  try {
    await dbConnect();
    
    // Obtener configuración del portfolio
    const portfolioSettings = await Page.findOne({ 
      slug: 'portfolio-settings', 
      isPublished: true 
    }).select('content').lean(); // ← .lean() es importante

    // Obtener estadísticas reales de proyectos
    const totalProjects = await Project.countDocuments({ isPublished: true });
    const featuredProjects = await Project.countDocuments({ isPublished: true, isFeatured: true });
    
    // Obtener tecnologías únicas
    const projects = await Project.find({ isPublished: true }).select('technologies').lean();
    const uniqueTechnologies = new Set();
    projects.forEach(project => {
      project.technologies?.forEach(tech => uniqueTechnologies.add(tech));
    });
    
    // Datos por defecto
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
      },
      categories: [
        { name: "E-commerce", count: `${Math.floor(totalProjects * 0.3)}+`, color: "from-green-400 to-emerald-500" },
        { name: "Aplicaciones Web", count: `${Math.floor(totalProjects * 0.4)}+`, color: "from-cyan-400 to-blue-500" },
        { name: "Dashboards", count: `${Math.floor(totalProjects * 0.2)}+`, color: "from-purple-400 to-pink-500" },
        { name: "Landing Pages", count: `${Math.floor(totalProjects * 0.1)}+`, color: "from-orange-400 to-red-500" }
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
    };
    
    if (!portfolioSettings || !portfolioSettings.content) {
      // Solo devolver el objeto content, NO el documento completo
      return NextResponse.json({ content: defaultData });
    }
    
    // Combinar configuración personalizada con stats reales
    // IMPORTANTE: Eliminar _id del objeto antes de devolverlo
    const { _id, ...cleanContent } = portfolioSettings.content || {};
    
    const responseData = {
      ...cleanContent,
      stats: {
        ...cleanContent.stats,
        totalProjects,
        featuredProjects,
        technologies: uniqueTechnologies.size
      }
    };
    
    return NextResponse.json({ content: responseData });
    
  } catch (error) {
    console.error('❌ Error fetching portfolio settings:', error);
    
    // Siempre devolver algo válido
    return NextResponse.json({ 
      content: {
        hero: {
          title: "Portfolio",
          subtitle: "Casos de éxito en desarrollo web", 
          description: "Proyectos profesionales con tecnologías modernas."
        },
        stats: {
          totalProjects: 0,
          featuredProjects: 0,
          technologies: 0,
          clientSatisfaction: "98%"
        }
      }
    });
  }
}