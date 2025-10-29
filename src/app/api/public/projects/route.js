// src/app/api/public/projects/route.js - VERSIÓN CORREGIDA
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Project from '@/models/Project'

export async function GET() {
  try {
    await dbConnect()
    
    const projects = await Project.find({ isActive: true })
      .select('title subtitle description content technologies category status metrics features images urls slug year isFeatured client codeSnippet results challenges learnings')
      .sort({ orderIndex: 1, createdAt: -1 })
      .lean()

    const serializedProjects = projects.map(project => ({
      ...project,
      _id: project._id.toString()
    }))

    console.log(`✅ API Public Projects: ${serializedProjects.length} proyectos encontrados`)

    return NextResponse.json(serializedProjects, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
    
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    return NextResponse.json([], { status: 500 })
  }
}