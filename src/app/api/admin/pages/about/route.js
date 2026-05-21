// src/app/api/admin/pages/about/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const aboutPage = await Page.findOne({ slug: 'about' })
    
    if (!aboutPage) {
      // Return default structure
      return NextResponse.json({ 
        content: {
          hero: {
            title: "Sobre Luis Granero",
            subtitle: "Mi historia como desarrollador",
            description: "",
            image: "",
            stats: []
          },
          story: {
            title: "Mi Trayectoria",
            content: "",
            highlights: []
          },
          experience: [],
          skills: {
            technical: [],
            soft: [],
            tools: []
          },
          methodology: {
            title: "Cómo trabajo",
            description: "",
            steps: []
          },
          values: []
        }
      })
    }
    
    return NextResponse.json(aboutPage)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {


    await dbConnect()
    
    const data = await request.json()
    
    const aboutPage = await Page.findOneAndUpdate(
      { slug: 'about' },
      {
        slug: 'about',
        title: 'Sobre Mí',
        content: data,
        seo: {
          metaTitle: data.hero?.title || 'Sobre Luis Granero - Desarrollador Web',
          metaDescription: data.hero?.description || 'Conoce mi historia, experiencia y metodología de trabajo como desarrollador web freelance.'
        },
        isPublished: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ message: 'About page updated successfully', data: aboutPage })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}