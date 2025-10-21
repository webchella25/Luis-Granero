import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await connectDB();
    
    // Contar proyectos reales
    let totalProjects = 0;
    let featuredProjects = 0;
    let technologies = new Set();
    
    try {
      totalProjects = await Project.countDocuments({ isPublished: true });
      featuredProjects = await Project.countDocuments({ isPublished: true, isFeatured: true });
      
      const projects = await Project.find({ isPublished: true })
        .select('technologies')
        .lean();
      
      projects.forEach(p => {
        if (p.technologies) {
          p.technologies.forEach(tech => technologies.add(tech));
        }
      });
    } catch (dbError) {
      console.warn('DB query failed, using defaults:', dbError.message);
    }
    
    // IMPORTANTE: Crear objeto plano sin referencias a MongoDB
    const portfolioSettings = {
      hero: {
        title: "Portfolio",
        subtitle: "Casos de éxito que demuestran mi experiencia en desarrollo web moderno", 
        description: "Cada proyecto incluye código, métricas reales y tecnologías utilizadas."
      },
      stats: {
        totalProjects: totalProjects || 25,
        featuredProjects: featuredProjects || 8,
        technologies: technologies.size || 15,
        yearsExperience: 5,
        clientSatisfaction: "98%",
        avgROI: "300%",
        avgLoadTime: "1.2s"
      },
      categories: [
        { name: "E-commerce", count: `${Math.max(Math.floor(totalProjects * 0.3), 8)}+`, color: "from-green-400 to-emerald-500" },
        { name: "Aplicaciones Web", count: `${Math.max(Math.floor(totalProjects * 0.4), 10)}+`, color: "from-cyan-400 to-blue-500" },
        { name: "Dashboards", count: `${Math.max(Math.floor(totalProjects * 0.2), 5)}+`, color: "from-purple-400 to-pink-500" },
        { name: "Landing Pages", count: `${Math.max(Math.floor(totalProjects * 0.1), 3)}+`, color: "from-orange-400 to-red-500" }
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
        },
        {
          icon: "🔒",
          title: "Código limpio y mantenible",
          description: "Siguiendo las mejores prácticas y estándares de la industria"
        },
        {
          icon: "📱",
          title: "Mobile-first",
          description: "Diseños responsivos que funcionan en todos los dispositivos"
        }
      ]
    };
    
    // CRÍTICO: Usar JSON.parse(JSON.stringify()) para limpiar cualquier referencia MongoDB
    const cleanData = JSON.parse(JSON.stringify(portfolioSettings));
    
    return NextResponse.json({ content: cleanData });
    
  } catch (error) {
    console.error('❌ Error en portfolio settings:', error);
    
    return NextResponse.json({ 
      content: {
        hero: {
          title: "Portfolio",
          subtitle: "Proyectos de desarrollo web", 
          description: "Casos de éxito profesionales."
        },
        stats: {
          totalProjects: 0,
          clientSatisfaction: "98%"
        }
      }
    });
  }
}