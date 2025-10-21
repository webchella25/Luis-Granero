// src/app/api/admin/projects/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean()
    
    // Convertir ObjectId a strings
    const serializedProjects = projects.map(project => ({
      ...project,
      _id: project._id.toString()
    }))
    
    return NextResponse.json(serializedProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const data = await request.json()
    
    const project = await Project.create(data)
    
    return NextResponse.json({ 
      success: true,
      project: {
        ...project.toObject(),
        _id: project._id.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}