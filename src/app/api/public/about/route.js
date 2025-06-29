// src/app/api/public/about/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const aboutPage = await Page.findOne({ 
      slug: 'about', 
      isPublished: true 
    }).select('content seo updatedAt')
    
    if (!aboutPage) {
      // Devolver datos por defecto en lugar de error
      return NextResponse.json({
        content: {
          hero: {
            title: "Luis Granero",
            subtitle: "Desarrollador Web Full Stack Freelance",
            description: "Especializado en React, Next.js y soluciones web personalizadas. Transformo ideas en aplicaciones modernas y exitosas.",
            stats: [
              { label: "Años de experiencia", value: "10+" },
              { label: "Proyectos completados", value: "50+" },
              { label: "Satisfacción del cliente", value: "98%" },
              { label: "Tecnologías dominadas", value: "20+" }
            ]
          },
          story: {
            title: "Mi Trayectoria",
            content: "Comencé mi carrera en el desarrollo web hace más de una década, especializándome primero en WordPress y evolucionando hacia las tecnologías más modernas como React y Next.js. Mi enfoque siempre ha sido crear soluciones que no solo funcionen, sino que aporten valor real al negocio de mis clientes.",
            highlights: [
              "10+ años de experiencia en desarrollo web",
              "Especialista en React y Next.js",
              "Enfoque en soluciones personalizadas",
              "Migración exitosa a stack moderno"
            ]
          },
          experience: [
            {
              company: "Freelance",
              position: "Desarrollador Web Full Stack",
              period: "2020 - Presente",
              description: "Desarrollo de aplicaciones web personalizadas para startups y empresas, especializado en React, Next.js y soluciones de e-commerce.",
              technologies: ["React", "Next.js", "Node.js", "MongoDB", "TypeScript"],
              achievements: ["50+ proyectos completados", "98% satisfacción del cliente"]
            }
          ],
          skills: {
            technical: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB"],
            soft: ["Comunicación efectiva", "Resolución de problemas", "Trabajo en equipo"],
            tools: ["VS Code", "Git", "Docker", "Vercel", "Figma"]
          },
          methodology: {
            title: "Mi Metodología",
            description: "Un proceso estructurado que garantiza resultados excepcionales",
            steps: [
              {
                title: "Análisis y Planificación",
                description: "Entiendo tus necesidades, objetivos y audiencia para crear una estrategia sólida.",
                icon: "🎯"
              },
              {
                title: "Desarrollo Ágil",
                description: "Implemento la solución usando las mejores prácticas y tecnologías modernas.",
                icon: "⚡"
              }
            ]
          },
          values: [
            {
              title: "Calidad ante todo",
              description: "Cada línea de código está pensada para ser mantenible, escalable y eficiente.",
              icon: "💎"
            }
          ]
        },
        seo: {
          metaTitle: "Sobre Luis Granero - Desarrollador Web Freelance",
          metaDescription: "Conoce mi historia, experiencia y metodología de trabajo como desarrollador web especializado en React y Next.js."
        }
      })
    }
    
    return NextResponse.json(aboutPage, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
    
  } catch (error) {
    console.error('Error fetching about page:', error)
    
    // En caso de error, devolver datos básicos en lugar de fallar
    return NextResponse.json({
      content: {
        hero: {
          title: "Luis Granero",
          subtitle: "Desarrollador Web Full Stack",
          description: "Especializado en desarrollo web moderno"
        }
      }
    })
  }
}