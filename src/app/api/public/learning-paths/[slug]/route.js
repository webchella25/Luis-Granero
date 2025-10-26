// src/app/api/public/learning-paths/[slug]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    // Buscar la ruta por slug y que esté publicada
    const path = await LearningPath.findOne({ 
      slug, 
      isPublished: true 
    })
      .populate({
        path: 'articles.postId',
        select: 'title slug excerpt content category tags readTime author publishedAt'
      })
      .lean();
    
    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Ruta no encontrada' },
        { status: 404 }
      );
    }
    
    // Incrementar contador de vistas (opcional)
    await LearningPath.findByIdAndUpdate(path._id, {
      $inc: { views: 1 }
    });
    
    return NextResponse.json({
      success: true,
      path
    });
    
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cargar la ruta' },
      { status: 500 }
    );
  }
}