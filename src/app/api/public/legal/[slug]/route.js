// src/app/api/public/legal/[slug]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LegalPage from '@/models/LegalPage';
import { getLegalSettings } from '@/lib/getLegalSettings';
import { replaceLegalVariables } from '@/lib/replaceLegalVariables';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = params;
    
    // Obtener página legal
    const page = await LegalPage.findOne({ 
      slug, 
      isPublished: true 
    }).lean();
    
    if (!page) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }
    
    // Obtener settings del sitio para reemplazar variables
    const settings = await getLegalSettings();
    
    // Reemplazar variables en el contenido
    const processedContent = replaceLegalVariables(page.content, settings);
    
    return NextResponse.json({
      success: true,
      page: {
        ...page,
        content: processedContent
      }
    });
  } catch (error) {
    console.error('Error fetching legal page:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}