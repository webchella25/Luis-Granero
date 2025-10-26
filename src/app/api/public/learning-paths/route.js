// src/app/api/public/learning-paths/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LearningPath from '@/models/LearningPath';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    
    // Obtener solo las rutas publicadas, ordenadas por featured primero
    const paths = await LearningPath.find({ isPublished: true })
      .select('title slug description duration level topics articles icon isFeatured isPremium enrollments')
      .populate({
        path: 'articles.postId',
        select: 'title slug excerpt'
      })
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      paths: paths || [],
      total: paths.length
    });
    
  } catch (error) {
    console.error('Error fetching public learning paths:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al cargar las rutas',
        paths: []
      },
      { status: 500 }
    );
  }
}