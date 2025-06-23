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
      // Fallback a datos por defecto
      return NextResponse.json({
        content: {
          hero: {
            title: "Sobre Luis Granero",
            subtitle: "Mi historia como desarrollador",
            description: "Soy un desarrollador web con más de 10 años de experiencia, especializado en crear soluciones digitales que transforman ideas en realidad.",
            image: "/images/about/luis-granero.jpg"
          },
          story: {
            title: "Mi Trayectoria",
            content: "Comencé mi carrera en el desarrollo web hace más de una década, cuando WordPress dominaba el panorama. Sin embargo, con el tiempo sentí la necesidad de ir más allá, alejándome de las soluciones genéricas y centrándome en el desarrollo personalizado y de alto rendimiento. Hoy me posiciono como un desarrollador técnico que construye soluciones a medida para startups, empresas tecnológicas y negocios que necesitan algo más que una web bonita: necesitan resultados.",
            highlights: [
              "10+ años de experiencia en desarrollo web",
              "Especialista en React y Next.js",
              "Enfoque en soluciones personalizadas",
              "Resultados medibles y performance óptima"
            ]
          },
          experience: [
            {
              company: "Freelance",
              position: "Desarrollador Web Full Stack",
              period: "2020 - Presente",
              description: "Desarrollo de aplicaciones web personalizadas para startups y empresas, especializado en React, Next.js y soluciones de e-commerce.",
              technologies: ["React", "Next.js", "Node.js", "MongoDB"],
              achievements: ["50+ proyectos completados", "98% satisfacción del cliente"]
            }
          ],
          skills: {
            technical: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "Tailwind CSS", "Git"],
            soft: ["Comunicación efectiva", "Resolución de problemas", "Gestión de proyectos", "Trabajo en equipo"],
            tools: ["VS Code", "Git", "Docker", "Vercel", "Figma", "Postman"]
          },
          methodology: {
            title: "Mi Metodología de Trabajo",
            description: "Trabajo con metodología ágil, priorizando la comunicación transparente y la entrega de valor en cada iteración.",
            steps: [
              "Análisis y planificación detallada",
              "Desarrollo iterativo con feedback constante",
              "Testing y optimización continua",
              "Entrega y soporte post-lanzamiento"
            ]
          },
          values: [
            {
              title: "Calidad",
              description: "Código limpio, escalable y mantenible en cada proyecto",
              icon: "💎"
            },
            {
              title: "Transparencia",
              description: "Comunicación clara y honesta en todo el proceso",
              icon: "🔍"
            },
            {
              title: "Resultados",
              description: "Enfoque en objetivos medibles y ROI real",
              icon: "🎯"
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
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}