// src/app/api/admin/quick-stats/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import BlogPost from '@/models/BlogPost'
import Message from '@/models/Message'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Obtener estadísticas rápidas
    const activeProjects = await Project.countDocuments({ 
      status: 'En producción',
      isActive: true 
    })

    const publishedPosts = await BlogPost.countDocuments({ 
      status: 'published' 
    })

    const unreadMessages = await Message.countDocuments({ 
      isRead: false 
    })

    // Simular visitas semanales (puedes conectar con Google Analytics después)
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