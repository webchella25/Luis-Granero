// src/app/api/public/homepage/route.js - Actualizado
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';

export async function GET() {
  try {
    await dbConnect();
    
    // Buscar homepage publicada
    const homepage = await Page.findOne({ 
      slug: 'homepage', 
      isPublished: true 
    }).select('content seo updatedAt');

    // Buscar servicios también
    const servicesPage = await Page.findOne({ 
      slug: 'services', 
      isPublished: true 
    }).select('content updatedAt');
    
    if (!homepage) {
      // Fallback a datos por defecto
      const { homepageSchema } = await import('@/lib/pageData');
      return NextResponse.json({
        content: homepageSchema,
        services: servicesPage?.content?.services || homepageSchema.services,
        seo: {
          metaTitle: 'Luis Granero - Desarrollador Web Freelance',
          metaDescription: 'Especializado en React, Next.js y soluciones personalizadas'
        }
      });
    }
    
    // Combinar datos de homepage + servicios
    const responseData = {
      ...homepage.toObject(),
      services: servicesPage?.content?.services || []
    };
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
    
  } catch (error) {
    console.error('Error fetching homepage:', error);
    
    // En caso de error, devolver datos por defecto
    const { homepageSchema } = await import('@/lib/pageData');
    return NextResponse.json({
      content: homepageSchema,
      services: homepageSchema.services,
      seo: {
        metaTitle: 'Luis Granero - Desarrollador Web Freelance',
        metaDescription: 'Especializado en React, Next.js y soluciones personalizadas'
      }
    });
  }
}