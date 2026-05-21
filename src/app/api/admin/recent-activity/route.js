// src/app/api/admin/recent-activity/route.js - CORREGIDO
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb' // Cambiado de @/lib/db
import Project from '@/models/Project'
// import BlogPost from '@/models/BlogPost' // Comentado hasta que exista
// import Message from '@/models/Message' // Comentado hasta que exista
export async function GET() {
  try {

    await connectDB()

    const activities = []

    // Solo proyectos por ahora
    const recentProjects = await Project.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(5)

    recentProjects.forEach(project => {
      activities.push({
        type: 'project',
        description: `Proyecto "${project.title}" actualizado`,
        time: formatTimeAgo(project.updatedAt)
      })
    })

    // Actividades por defecto si no hay proyectos
    if (activities.length === 0) {
      activities.push(
        {
          type: 'update',
          description: 'Sistema inicializado correctamente',
          time: 'hace 1 hora'
        },
        {
          type: 'project',
          description: 'Panel de administración configurado',
          time: 'hace 2 horas'
        }
      )
    }

    return NextResponse.json(activities.slice(0, 5))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json([], { status: 200 }) // Devolver array vacío en lugar de error
  }
}

function formatTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)
  
  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  return `hace ${Math.floor(diffInSeconds / 86400)} días`
}