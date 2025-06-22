// src/app/api/public/projects/featured/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await dbConnect();
    
    // Obtener 3 proyectos destacados y publicados
    const projects = await Project.find({ 
      isPublished: true,
      isFeatured: true 
    })
    .select('title description technologies metrics images slug status')
    .sort({ createdAt: -1 })
    .limit(3);
    
    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
    
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    
    // Devolver array vacío en caso de error
    return NextResponse.json([], { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300', // Cache más corto para errores
      }
    });
  }
}