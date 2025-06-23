// src/app/api/admin/services/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const servicesPage = await Page.findOne({ slug: 'services' })
    
    if (!servicesPage) {
      // Return default services from pageData
      const { homepageSchema } = await import('@/lib/pageData')
      return NextResponse.json({ services: homepageSchema.services })
    }
    
    return NextResponse.json({ services: servicesPage.content.services || [] })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { services } = await request.json()
    
    const servicesPage = await Page.findOneAndUpdate(
      { slug: 'services' },
      {
        slug: 'services',
        title: 'Servicios',
        content: { services },
        seo: {
          metaTitle: 'Servicios - Luis Granero | Desarrollo Web Personalizado',
          metaDescription: 'Servicios de desarrollo web moderno: React, Next.js, e-commerce, APIs y soluciones personalizadas. Sin plantillas genéricas.'
        },
        isPublished: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ 
      message: 'Services updated successfully', 
      data: servicesPage 
    })
  } catch (error) {
    console.error('Error saving services:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}