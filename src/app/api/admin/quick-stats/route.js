// src/app/api/admin/quick-stats/route.js - CORREGIDO
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb' // Cambiado de @/lib/db
import Project from '@/models/Project'
// import BlogPost from '@/models/BlogPost' // Comentado hasta que exista
// import Message from '@/models/Message' // Comentado hasta que exista
import { checkAuth } from '@/lib/checkAuth'

export async function GET() {
  try {
    const session = await checkAuth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Obtener estadísticas básicas por ahora
    const activeProjects = await Project.countDocuments({ 
      isActive: true 
    })

    // Valores por defecto hasta implementar los modelos faltantes
    const publishedPosts = 0 // await BlogPost.countDocuments({ status: 'published' })
    const unreadMessages = 0 // await Message.countDocuments({ isRead: false })
    const weeklyVisits = Math.floor(Math.random() * 500) + 200

    return NextResponse.json({
      activeProjects,
      publishedPosts,
      unreadMessages,
      weeklyVisits
    })
  } catch (error) {
    console.error('Error fetching quick stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}