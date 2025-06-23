// src/app/api/public/services/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const servicesPage = await Page.findOne({ 
      slug: 'services', 
      isPublished: true 
    }).select('content updatedAt')
    
    if (!servicesPage) {
      // Fallback a datos por defecto
      const { homepageSchema } = await import('@/lib/pageData')
      return NextResponse.json({
        services: homepageSchema.services
      })
    }
    
    return NextResponse.json({
      services: servicesPage.content.services || []
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
    
  } catch (error) {
    console.error('Error fetching public services:', error)
    
    // En caso de error, devolver datos por defecto
    const { homepageSchema } = await import('@/lib/pageData')
    return NextResponse.json({
      services: homepageSchema.services
    })
  }
}