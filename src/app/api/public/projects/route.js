// src/app/api/public/projects/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET() {
  try {
    await dbConnect()
    
    // Obtener todos los proyectos publicados
    const projects = await Project.find({ 
      isPublished: true 
    })
    .select('title description technologies category status metrics features images slug year isFeatured createdAt')
    .sort({ createdAt: -1 })
    .lean()
    
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300',
      }
    })
  }
}