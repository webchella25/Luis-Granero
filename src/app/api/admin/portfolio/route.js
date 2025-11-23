// src/app/api/admin/portfolio/route.js
import { NextResponse } from 'next/server'
import { checkAuth } from '@/lib/checkAuth'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET() {
  try {
    await dbConnect()
    
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean()
    
    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await checkAuth()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const data = await request.json()
    
    const project = new Project(data)
    await project.save()
    
    return NextResponse.json({ message: 'Project created successfully', project })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}