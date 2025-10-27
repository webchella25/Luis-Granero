// src/app/api/public/projects/[slug]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Esperar params si es Promise (Next.js 15)
    const resolvedParams = await Promise.resolve(params);
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Buscar proyecto por slug
    const project = await Project.findOne({ 
      slug: slug,
      isActive: true 
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Incrementar contador de vistas
    project.stats.views = (project.stats.views || 0) + 1;
    await project.save();

    // Convertir _id a string para evitar errores de serialización
    const projectData = {
      ...project.toObject(),
      _id: project._id.toString()
    };

    return NextResponse.json(projectData);
    
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}