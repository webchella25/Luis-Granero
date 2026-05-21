// src/app/api/public/projects/featured/route.js - Actualizar
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET() {
  try {
    await dbConnect();
    
    // Obtener proyectos activos, priorizando los marcados como destacados
    const projects = await Project.find({
      isActive: true
    })
    .sort({ isFeatured: -1, createdAt: -1 })
    .select('title description technologies metrics images slug status category year isOwnProject')
    .limit(6)
    .lean();
    
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
        'Cache-Control': 'public, s-maxage=300',
      }
    });
  }
}