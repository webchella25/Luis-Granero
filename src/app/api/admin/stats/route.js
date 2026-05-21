// src/app/api/admin/stats/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'
import Post from '@/models/Post'

export async function GET() {
  try {
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