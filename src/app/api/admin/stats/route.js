// src/app/api/admin/stats/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import Post from '@/models/Post'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const [projects, posts] = await Promise.all([
      Project.countDocuments(),
      Post.countDocuments()
    ])
    
    return NextResponse.json({
      projects,
      posts,
      messages: 0 // Por ahora 0, luego implementar
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}