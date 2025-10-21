// src/app/api/public/projects/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET() {
  try {
    await dbConnect()
    
    const projects = await Project.find({ isPublished: true })
      .select('title description technologies category status metrics features images slug year isFeatured')
      .sort({ createdAt: -1 })
      .lean()

    // CRÍTICO: Convertir _id de ObjectId a string
    const serializedProjects = projects.map(project => ({
      ...project,
      _id: project._id.toString()
    }))

    return NextResponse.json(serializedProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json([])
  }
}