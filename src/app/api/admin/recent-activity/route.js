// src/app/api/admin/recent-activity/route.js
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

    const activities = []

    // Proyectos recientes
    const recentProjects = await Project.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(3)

    recentProjects.forEach(project => {
      activities.push({
        type: 'project',
        description: `Proyecto "${project.title}" actualizado`,
        time: formatTimeAgo(project.updatedAt)
      })
    })

    // Blog posts recientes
    const recentPosts = await BlogPost.find({ status: 'published' })
      .sort({ updatedAt: -1 })
      .limit(2)

    recentPosts.forEach(post => {
      activities.push({
        type: 'blog',
        description: `Artículo "${post.title}" publicado`,
        time: formatTimeAgo(post.updatedAt)
      })
    })

    // Mensajes recientes
    const recentMessages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(2)

    recentMessages.forEach(message => {
      activities.push({
        type: 'message',
        description: `Nuevo mensaje de ${message.name}`,
        time: formatTimeAgo(message.createdAt)
      })
    })

    // Ordenar por fecha
    activities.sort((a, b) => new Date(b.time) - new Date(a.time))

    return NextResponse.json(activities.slice(0, 5))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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